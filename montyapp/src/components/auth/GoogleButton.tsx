import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authErrorMessage, signInWithGoogle, type GoogleIntent } from "@/lib/auth";

/** Google's four-colour mark. Their brand terms require it be shown unaltered. */
function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.71-1.57 2.69-3.89 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

interface GoogleButtonProps {
  /** Path on this site to return to. Omitted means "carry on to the app". */
  next?: string;
  /** What the visitor thinks they are doing, for the callback to check. */
  intent?: GoogleIntent;
  /** Completes "Continue with Google" — the label, minus the provider. */
  label?: string;
  disabled?: boolean;
  /**
   * Runs before the hand-off; return false to call it off.
   *
   * This is how /signup holds the button behind its consent tick. It has to be
   * a veto rather than `disabled`, because a disabled button is a dead end — it
   * cannot be clicked, so it cannot explain why, and the visitor is left
   * hunting for what is wrong. Cancelling on click lets the caller point at the
   * unticked box instead.
   */
  beforeStart?: () => boolean;
  /**
   * Record that this visitor agreed to the Terms and the Privacy Policy, as of
   * the click. Set on the sign-up route, where `beforeStart` has just confirmed
   * the tick; left off on /login, where nobody is being asked to agree to
   * anything and a stamp would be an invention.
   *
   * Taken here rather than passed in, because the visitor may have had the page
   * open for an hour — a timestamp computed while rendering would record when
   * they arrived, not when they agreed.
   */
  stampConsent?: boolean;
}

/**
 * Starts the Google hand-off. There is no success branch to handle: the browser
 * leaves for Google's account chooser and comes back at /auth/callback, so the
 * spinner stays on until the page is gone.
 */
export function GoogleButton({
  next,
  intent,
  label = "Continue with Google",
  disabled = false,
  beforeStart,
  stampConsent = false,
}: GoogleButtonProps) {
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    // Checked before the spinner, or a cancelled attempt leaves the button
    // saying it is taking them to Google when it is doing nothing of the sort.
    if (beforeStart && !beforeStart()) return;

    setError(null);
    setLeaving(true);
    try {
      await signInWithGoogle({
        next,
        intent,
        consentedAt: stampConsent ? new Date().toISOString() : undefined,
      });
    } catch (err) {
      setError(authErrorMessage(err));
      setLeaving(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={disabled || leaving}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
      >
        {leaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Taking you to Google…
          </>
        ) : (
          <>
            <GoogleMark />
            {label}
          </>
        )}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** The hairline "or" between the Google button and the email form. */
export function AuthDivider() {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
