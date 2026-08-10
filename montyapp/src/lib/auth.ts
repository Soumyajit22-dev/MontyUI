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
      emailRedirectTo: `${APP_URL}/login`,
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

/** What the recovery link left in the URL when the reset page opened. */
export type RecoveryOutcome = "ready" | "no-link";

/**
 * Turns the credentials a recovery link carries into a real session, which is
 * what lets `updatePassword` act on the account.
 *
 * The client runs with `detectSessionInUrl: false` so that no page of this site
 * silently signs someone in off a URL; the reset page is the one place that has
 * to, so it opts in by hand. Both link shapes are handled: implicit flow leaves
 * tokens in the fragment, PKCE leaves a `code` in the query string.
 *
 * Throws whatever the link reports — an expired or already-used link included.
 */
export async function consumeRecoveryLink(): Promise<RecoveryOutcome> {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);

  // Supabase reports a refused link through the redirect itself rather than an
  // HTTP error, so this has to be read before looking for any credentials.
  const errorCode = hash.get("error_code") ?? query.get("error_code");
  const errorDescription = hash.get("error_description") ?? query.get("error_description");
  if (errorCode || errorDescription) {
    throw new AuthError(
      errorDescription?.replace(/\+/g, " ") ?? "That reset link is no longer valid.",
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

  // Opened directly rather than through an email. A session may still exist
  // from a link consumed a moment ago — a reload of this page, typically.
  return (await getSessionUser()) ? "ready" : "no-link";
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
