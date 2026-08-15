import { AuthError, type User } from "@supabase/supabase-js";
import { APP_URL, supabase } from "./supabase";
import { clearSharedSession } from "./sso";

/** Signup either lands the user straight in, or parks them until they confirm their email. */
export type SignUpOutcome = "active" | "needs-confirmation";

/**
 * Supabase surfaces most failures as terse machine strings. Translate the ones a
 * visitor can actually act on; anything else falls back to the raw message so a
 * misconfigured project doesn't silently look like a typo'd password.
 */
export function authErrorMessage(error: unknown): string {
  if (!(error instanceof AuthError)) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  switch (error.code) {
    case "invalid_credentials":
      return "That email and password don't match an account.";
    case "email_not_confirmed":
      return "Confirm your email first — check your inbox for the link we sent.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Sign in instead.";
    case "weak_password":
      return "Please choose a stronger password — at least 8 characters.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts. Wait a minute and try again.";
    case "signup_disabled":
      return "New signups are currently closed.";
    case "provider_disabled":
    case "oauth_provider_not_supported":
      return "Google sign-in isn't available right now. Use your email and password instead.";
    case "bad_oauth_state":
      return "That sign-in attempt expired before it finished. Please try again.";
    case "user_banned":
      return "This account has been suspended. Contact support if that's unexpected.";
    case "validation_failed":
      return "Please check the details you entered.";
    case "otp_expired":
      return "That reset link has expired. Request a new one below.";
    case "same_password":
      return "That is already your password. Please choose a different one.";
    default:
      return error.message;
  }
}

export async function signUpWithPassword(
  email: string,
  password: string,
  fullName: string
): Promise<SignUpOutcome> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // The confirmation link drops them on the product app, not back here.
      // Its root is the sign-in surface; `/login` is not a route over there.
      emailRedirectTo: `${APP_URL}/`,
    },
  });

  if (error) throw error;

  // With email confirmation on, Supabase does not reveal that an address is taken:
  // it returns a user with an empty identities array instead of an error.
  if (data.user && data.user.identities?.length === 0) {
    throw new AuthError(
      "An account with this email already exists. Sign in instead.",
      400,
      "user_already_exists"
    );
  }

  // A session comes back only when email confirmation is disabled on the project.
  return data.session ? "active" : "needs-confirmation";
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Where the link in a password-reset email drops the visitor back. */
export const RESET_PATH = "/reset-password";

/**
 * Emails a recovery link. Supabase deliberately answers the same way whether or
 * not the address has an account, so callers must not branch on the result —
 * doing so would turn this into an account-existence oracle.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // The new-password form lives on this site, not the product app.
    redirectTo: `${window.location.origin}${RESET_PATH}`,
  });
  if (error) throw error;
}

/** Whether a landing page found redeemable credentials in its URL. */
export type RedirectOutcome = "ready" | "no-link";

/** Kept for the reset page, which named this outcome before OAuth shared it. */
export type RecoveryOutcome = RedirectOutcome;

/**
 * Turns the credentials a Supabase redirect carries into a real session.
 *
 * The client runs with `detectSessionInUrl: false` so that no page of this site
 * silently signs someone in off a URL; the two landing pages that have to —
 * password recovery and the OAuth callback — opt in by calling this. Both link
 * shapes are handled: implicit flow leaves tokens in the fragment, PKCE leaves
 * a `code` in the query string.
 *
 * `requireType` is what stops a page redeeming credentials that were not meant
 * for it. Supabase stamps `type=recovery` on a password-reset redirect and
 * nothing on a sign-in, so the reset page can insist on the former; without
 * that check a misrouted OAuth redirect lands on /reset-password carrying a
 * perfectly valid session, and the page cheerfully offers to change the
 * password of the account that just signed in with Google.
 *
 * Throws whatever the redirect reports — an expired or already-used link, or a
 * consent the visitor declined at Google.
 */
async function consumeAuthRedirect(
  refusal: string,
  requireType?: string
): Promise<RedirectOutcome> {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);

  // Supabase reports a refused link through the redirect itself rather than an
  // HTTP error, so this has to be read before looking for any credentials.
  const errorCode = hash.get("error_code") ?? query.get("error_code");
  const errorDescription = hash.get("error_description") ?? query.get("error_description");
  if (errorCode || errorDescription) {
    throw new AuthError(
      errorDescription?.replace(/\+/g, " ") ?? refusal,
      400,
      errorCode ?? "otp_expired"
    );
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  const code = query.get("code");

  // Credentials addressed to some other page. Leave them alone rather than
  // redeem them: whatever they were for is still mid-flight.
  if (requireType && (hash.get("type") ?? query.get("type")) !== requireType) {
    if (accessToken || code) return "no-link";
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return "ready";
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return "ready";
  }

  // Opened directly rather than through the redirect. A session may still exist
  // from one consumed a moment ago — a reload of this page, typically.
  return (await getSessionUser()) ? "ready" : "no-link";
}

/** Redeems the link from a password-reset email, so `updatePassword` can act. */
export function consumeRecoveryLink(): Promise<RecoveryOutcome> {
  return consumeAuthRedirect("That reset link is no longer valid.", "recovery");
}

/** Where Google returns the visitor once they have picked an account. */
export const OAUTH_CALLBACK_PATH = "/auth/callback";

/**
 * Only same-site paths may be handed to `next`. Google's redirect target is
 * fixed and allow-listed, but the path it carries comes off our own URL, so
 * this is what stops a crafted link turning the callback into an open redirect.
 * A leading `//` or `/\` is a protocol-relative URL, not a path.
 */
function safeNext(next: string | null): string | null {
  if (!next || !next.startsWith("/") || /^\/[/\\]/.test(next)) return null;
  return next;
}

/**
 * Which button was pressed. Google itself draws no such distinction — there is
 * one endpoint, and it creates the account when none exists — so the only way
 * the callback can know what the visitor believed they were doing is to carry
 * it across the round trip and compare it with what actually happened.
 */
export type GoogleIntent = "signup" | "signin";

interface GoogleOptions {
  /** A path on this site to return to, for a visitor mid-purchase. */
  next?: string;
  intent?: GoogleIntent;
}

interface PendingGoogle {
  intent: GoogleIntent | null;
  next: string | null;
}

const PENDING_KEY = "citepark.google-attempt";

/**
 * Supabase only honours `redirect_to` when the URL is in the project's allow
 * list; otherwise it quietly substitutes the Site URL and forwards the tokens
 * there anyway. That loses the query string, and with it the intent — so the
 * same facts are parked in sessionStorage, which survives the trip to Google
 * and back no matter which page Supabase chooses to return to.
 */
function rememberGoogleAttempt(pending: PendingGoogle): void {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  } catch {
    // Private browsing, or storage full. The URL params still cover the case
    // where the redirect lands where it was asked to.
  }
}

/** Reads and clears the pending attempt — a return trip is only valid once. */
export function takeGoogleAttempt(): PendingGoogle | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PENDING_KEY);

    const parsed = JSON.parse(raw) as PendingGoogle;
    return {
      intent: parsed.intent === "signup" || parsed.intent === "signin" ? parsed.intent : null,
      next: safeNext(parsed.next ?? null),
    };
  } catch {
    return null;
  }
}

/** Whether this tab is waiting on a Google round trip it started itself. */
export function hasPendingGoogleAttempt(): boolean {
  try {
    return sessionStorage.getItem(PENDING_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Whether the current URL carries credentials from a sign-in redirect.
 *
 * Recovery links are deliberately excluded: those belong to /reset-password,
 * which redeems them itself.
 */
export function urlHasSignInCredentials(): boolean {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);

  if ((hash.get("type") ?? query.get("type")) === "recovery") return false;

  return Boolean(
    hash.get("access_token") ||
      query.get("code") ||
      hash.get("error_code") ||
      query.get("error_code")
  );
}

/**
 * Hands the visitor to Google's account chooser. Returns only if the redirect
 * failed to start — on success the browser has already left the page.
 */
export async function signInWithGoogle({ next, intent }: GoogleOptions = {}): Promise<void> {
  const callback = new URL(OAUTH_CALLBACK_PATH, window.location.origin);
  const target = safeNext(next ?? null);
  if (target) callback.searchParams.set("next", target);
  if (intent) callback.searchParams.set("intent", intent);

  rememberGoogleAttempt({ intent: intent ?? null, next: target });

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
      // Without this, Google silently reuses whichever account the browser is
      // already signed into — the same stale-session trap the pay dialog exists
      // to avoid.
      queryParams: { prompt: "select_account" },
    },
  });

  if (error) throw error;
}

/** What the visitor pressed, as recorded on the way out to Google. */
export function intentFromUrl(): GoogleIntent | null {
  const intent = new URLSearchParams(window.location.search).get("intent");
  return intent === "signup" || intent === "signin" ? intent : null;
}

/** Redeems the credentials Google's redirect left on the callback page. */
export function completeGoogleSignIn(): Promise<RedirectOutcome> {
  return consumeAuthRedirect("That sign-in link is no longer valid.");
}

/** The path the callback was asked to return to, if it is safe to honour. */
export function redirectTargetFromUrl(): string | null {
  return safeNext(new URLSearchParams(window.location.search).get("next"));
}

/**
 * Whether Google created this account, as opposed to signing in to one that
 * already existed with a password.
 *
 * Supabase links a Google identity onto an existing user when the email
 * matches, so "did they just sign up?" cannot be read from the user alone —
 * both cases hand back a user with a google identity. What separates them is
 * *when* that identity appeared: an account Google created has both timestamps
 * written in the same transaction, while a linked one has the identity showing
 * up whenever the visitor first used the button — days later, typically.
 */
export function isGoogleNativeAccount(user: User): boolean {
  const google = user.identities?.find((identity) => identity.provider === "google");
  if (!google?.created_at) return false;

  const gap = Math.abs(Date.parse(google.created_at) - Date.parse(user.created_at));
  return Number.isFinite(gap) && gap < 10_000;
}

/** Tells /login it was reached by someone who tried to sign *up* with Google. */
export const EXISTING_ACCOUNT_PARAM = "existing";

/** Tells /signup it was reached by someone whose account was just created. */
export const NEW_ACCOUNT_PARAM = "created";

/**
 * Where a completed Google round trip should leave the visitor. `null` means
 * the product app.
 *
 * The awkwardness here is not ours: Google has one endpoint, and it signs the
 * visitor in *and* creates the account when none existed. By the time we can
 * tell the two apart, the account exists either way — so pressing "sign in"
 * with an unknown address cannot be turned back into "you have no account".
 * The best available is to say so on the page they expected to need, with the
 * session they already have intact, rather than make them start over.
 */
export function decideGoogleDestination(
  user: User | null,
  intent: GoogleIntent | null,
  next: string | null
): string | null {
  // Mid-purchase beats everything — anything else abandons the checkout.
  if (next) return next;

  const justCreated = Boolean(user && isGoogleNativeAccount(user));

  if (intent === "signup" && !justCreated) {
    return `/login?${EXISTING_ACCOUNT_PARAM}=1`;
  }
  if (intent === "signin" && justCreated) {
    return `/signup?${NEW_ACCOUNT_PARAM}=1`;
  }
  return null;
}

/** Applies the new password to the account the current session belongs to. */
export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * The signed-in user, read from the session already in localStorage — no
 * network round trip, so it is cheap enough to call on a button press.
 */
export async function getSessionUser(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function signOut(): Promise<void> {
  // Unconditionally, and before the call that ends the session: this is the one
  // sign-out that is definitely deliberate, so it is allowed to end the app's
  // session too. The listener in ./sso.ts cannot make that call for itself —
  // supabase-js reports a refresh it could not complete the same way it reports
  // this, and guessing wrong there signs people out mid-sentence.
  clearSharedSession();
  await supabase.auth.signOut();
}

/**
 * Hand the visitor off to the product app.
 *
 * Nothing to carry: by the time anything calls this, the session that was just
 * created has been written to the cookie both domains share, and the app reads
 * it on load. See ./sso.ts.
 */
export function goToApp(): void {
  window.location.assign(APP_URL);
}
