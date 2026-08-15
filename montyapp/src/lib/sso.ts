/**
 * The signed-in handoff between citepark.com and app.citepark.com.
 *
 * Both surfaces trust the same Supabase project, but a session does not travel
 * on its own: supabase-js keeps it in localStorage, and localStorage is scoped
 * to one origin. So someone who signs in here arrives at the product app a
 * stranger, and is shown a second sign-in form for the account they just used.
 *
 * A cookie is the one store the two origins can share. `Domain=.citepark.com`
 * is sent to the apex and to every subdomain, so the app can read what this
 * site wrote — and, because the app writes it too, the other way round.
 *
 * What travels is the *refresh* token, not the whole session. It is short, so
 * it fits a cookie with room to spare and adds nothing measurable to every
 * request the two domains serve; and it is the half that can be exchanged for a
 * genuinely current session, which is what the reader actually wants. Handing
 * over an access token would mean handing over whatever was left of its hour.
 *
 * ## The rotation rule
 *
 * Supabase rotates the refresh token on every use and retires the one it
 * replaces, so two holders of one session are one exchange away from a token
 * the server no longer honours. That is survivable only if the cookie always
 * moves forward, which is this module's single invariant:
 *
 *   Only write a refresh token Supabase minted for this page. Never write one
 *   read back out of storage.
 *
 * A token restored from localStorage may already have been rotated by the app —
 * writing it would replace a live token with a revoked one, and hand the reader
 * exactly the login page this exists to prevent. `installSharedSessionSync`
 * enforces the rule by writing only on the events that carry a fresh token.
 */

import { supabase } from "./supabase";

const COOKIE_NAME = "citepark-sso";

/**
 * Supabase refresh tokens do not carry their own expiry, and the session they
 * belong to lives as long as it is used. A month is the point at which someone
 * who has not been back should be asked to sign in again.
 */
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/**
 * The last token this page put in the cookie, so a sign-out can tell its own
 * writes apart from the app's.
 *
 * Null on a fresh load, which is the conservative answer: nothing here minted
 * the cookie's current value, so nothing here should assume it may be removed.
 */
let lastWritten: string | null = null;

/**
 * The domain a cookie must carry to reach both citepark.com and its subdomains,
 * or null where no such domain exists.
 *
 * The registrable domain is taken as the last two labels. That is exactly right
 * for citepark.com and wrong for a multi-part suffix like co.uk — where the
 * browser rejects the cookie outright rather than honouring an over-broad one,
 * so the failure is a handoff that does not happen, never a cookie leaking to
 * somebody else's site. The same protection covers preview deployments on
 * *.vercel.app.
 *
 * localhost and bare IPs get null: they cannot carry a Domain attribute, and
 * there is nothing to share with in the first place.
 */
export function sharedCookieDomain(hostname: string): string | null {
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return null;
  // Bare IPv4, or an IPv6 literal.
  if (/^[\d.]+$/.test(hostname) || hostname.includes(":")) return null;

  const labels = hostname.split(".");
  if (labels.length < 2) return null;

  return `.${labels.slice(-2).join(".")}`;
}

/** The value of `name` in this document's cookies, if it is set. */
function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]) || null;
  } catch {
    // Not something this code wrote.
    return null;
  }
}

/** The refresh token the other origin left behind, if there is one. */
export function readSharedSession(): string | null {
  return readCookie(COOKIE_NAME);
}

/**
 * Whether a cookie on the shared domain would actually stick.
 *
 * Deriving the registrable domain from the last two labels is right for
 * citepark.com and wrong for a preview deployment on *.vercel.app, where
 * `.vercel.app` is a public suffix and the browser drops the cookie without
 * saying so. That silence is the problem: `bootstrapSharedSession` would read
 * back an empty cookie, conclude the handoff needs seeding, and rotate the
 * refresh token again on every single page load.
 *
 * So write a throwaway on the same domain and see whether it comes back. One
 * synchronous round trip through document.cookie, and it settles the question
 * for every environment at once rather than maintaining a list of the ones
 * where this does not apply.
 */
function sharedCookiesWork(): boolean {
  const probe = `${COOKIE_NAME}-probe`;
  const domain = sharedCookieDomain(window.location.hostname);
  if (!domain) return false;

  document.cookie = `${probe}=1; Domain=${domain}; Path=/; Max-Age=60; SameSite=Lax`;
  const stuck = readCookie(probe) === "1";
  if (stuck) {
    document.cookie = `${probe}=; Domain=${domain}; Path=/; Max-Age=0; SameSite=Lax`;
  }
  return stuck;
}

function writeCookie(value: string, maxAge: number): void {
  const domain = sharedCookieDomain(window.location.hostname);
  if (!domain) return;

  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    `Domain=${domain}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    // Lax, not Strict: arriving at app.citepark.com by following a link from
    // this site is a top-level navigation from another origin, and Strict would
    // withhold the cookie on exactly that request — the handoff itself.
    "SameSite=Lax",
    ...(window.location.protocol === "https:" ? ["Secure"] : []),
  ].join("; ");
}

/**
 * Offer a freshly minted refresh token to the other origin.
 *
 * Callers must honour the rotation rule above: this is for tokens Supabase has
 * just handed over, never for one read back out of storage.
 */
export function writeSharedSession(refreshToken: string): void {
  lastWritten = refreshToken;
  writeCookie(refreshToken, MAX_AGE_SECONDS);
}

/**
 * Take the handoff back.
 *
 * `onlyIfValue` is what keeps a sign-out here from signing the user out of a
 * session they are actively using over there. supabase-js reports a refresh it
 * could not complete as a plain SIGNED_OUT, which is indistinguishable from
 * someone pressing the button — and the most likely reason a refresh fails is
 * that the app rotated the token first and wrote the replacement here. Clearing
 * on that would end a session that is perfectly alive. So the automatic paths
 * pass the token they expected to find, and stand down when the cookie has
 * moved on without them; only a deliberate sign-out clears unconditionally.
 */
export function clearSharedSession(onlyIfValue?: string): void {
  if (onlyIfValue !== undefined && readSharedSession() !== onlyIfValue) return;

  lastWritten = null;
  // Same Domain and Path as the write, or this sets a second cookie instead of
  // removing the first.
  writeCookie("", 0);
}

/**
 * Keep the shared cookie in step with this site's session, for as long as the
 * page is open.
 *
 * INITIAL_SESSION is pointedly not handled. It reports the session restored
 * from localStorage, which is the one case the rotation rule forbids writing:
 * on a tab left open since before the app last refreshed, that token is already
 * spent. Every other event carries something Supabase minted just now.
 */
export function installSharedSessionSync(): void {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "INITIAL_SESSION") return;

    if (session?.refresh_token) {
      writeSharedSession(session.refresh_token);
      return;
    }

    if (event === "SIGNED_OUT" && lastWritten) {
      clearSharedSession(lastWritten);
    }
  });
}

/**
 * Reconcile this origin with the shared cookie, once, at startup.
 *
 * Two directions, and which one applies depends on where the user signed in:
 *
 *   adopt  Nothing in localStorage, a token in the cookie — they signed in at
 *          app.citepark.com, or cleared this site's storage and not its
 *          cookies. Either way they are signed in, and should not be shown a
 *          form. Exchanging the cookie's token is what makes this site agree.
 *
 *   seed   A session here, an empty cookie — signed in before this handoff
 *          existed, or in a browser that dropped the cookie. Asking Supabase to
 *          refresh produces a token that may be written under the rotation
 *          rule, where the one already in localStorage may not.
 *
 * Both branches end in a mint event, so `installSharedSessionSync` does the
 * writing and the rule stays in one place. Neither is fatal: a failure leaves
 * the user exactly as signed in as they were, facing the sign-in form they
 * would have seen anyway.
 */
export async function bootstrapSharedSession(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const shared = readSharedSession();

  if (!data.session && shared) {
    const { error } = await supabase.auth.refreshSession({ refresh_token: shared });
    // Spent or revoked. Drop it so every later page load stops paying for the
    // same failed exchange — but only if the app has not meanwhile replaced it.
    if (error) clearSharedSession(shared);
    return;
  }

  // Probe first. An empty cookie here means either "never seeded" or "cookies
  // on this domain go nowhere", and only the first is worth a token rotation.
  if (data.session && !shared && sharedCookiesWork()) {
    await supabase.auth.refreshSession();
  }
}
