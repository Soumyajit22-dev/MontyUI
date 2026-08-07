import { AuthError } from "@supabase/supabase-js";
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

/** Hand the visitor off to the product app, which runs its own auth middleware. */
export function goToApp(): void {
  window.location.assign(APP_URL);
}
