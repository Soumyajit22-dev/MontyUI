import { AuthError, type User } from "@supabase/supabase-js";
import { APP_URL, supabase } from "./supabase";

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
 * Throws whatever the redirect reports — an expired or already-used link, or a
 * consent the visitor declined at Google.
 */
async function consumeAuthRedirect(refusal: string): Promise<RedirectOutcome> {
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
  return consumeAuthRedirect("That reset link is no longer valid.");
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
 * Hands the visitor to Google's account chooser. Returns only if the redirect
 * failed to start — on success the browser has already left the page.
 *
 * `next` is where the callback should drop them afterwards: a path on this site
 * for a visitor who was in the middle of something (buying, typically), or
 * nothing at all to send them through to the product app.
 */
export async function signInWithGoogle(next?: string): Promise<void> {
  const callback = new URL(OAUTH_CALLBACK_PATH, window.location.origin);
  const target = safeNext(next ?? null);
  if (target) callback.searchParams.set("next", target);

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

/** Redeems the credentials Google's redirect left on the callback page. */
export function completeGoogleSignIn(): Promise<RedirectOutcome> {
  return consumeAuthRedirect("That sign-in link is no longer valid.");
}

/** The path the callback was asked to return to, if it is safe to honour. */
export function redirectTargetFromUrl(): string | null {
  return safeNext(new URLSearchParams(window.location.search).get("next"));
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
  await supabase.auth.signOut();
}

/** Hand the visitor off to the product app, which runs its own auth middleware. */
export function goToApp(): void {
  window.location.assign(APP_URL);
}
