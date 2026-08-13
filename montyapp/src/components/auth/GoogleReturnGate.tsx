import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  OAUTH_CALLBACK_PATH,
  authErrorMessage,
  completeGoogleSignIn,
  decideGoogleDestination,
  getSessionUser,
  goToApp,
  hasPendingGoogleAttempt,
  intentFromUrl,
  redirectTargetFromUrl,
  takeGoogleAttempt,
  urlHasSignInCredentials,
} from "@/lib/auth";

/**
 * Credentials on `/auth/callback` are ours by definition — nothing else routes
 * there. Anywhere else, the pending attempt is what proves this browser asked
 * for the sign-in, which matters when sessionStorage is unavailable and the
 * redirect did land where it was supposed to.
 */
function shouldFinishSignIn(): boolean {
  if (!urlHasSignInCredentials()) return false;
  return hasPendingGoogleAttempt() || window.location.pathname === OAUTH_CALLBACK_PATH;
}

type Stage = "idle" | "finishing" | "failed";

/**
 * Finishes a Google sign-in wherever Supabase happens to drop it.
 *
 * `/auth/callback` is where the redirect is *asked* to land, but Supabase only
 * honours that when the URL is in the project's allow list — otherwise it sends
 * the visitor to the Site URL with the tokens attached regardless. That turned a
 * misconfigured allow list into a sign-in that dead-ends on whatever page the
 * Site URL points at, which is how people ended up staring at the password
 * reset form.
 *
 * So the gate sits above the router and acts on two conditions together:
 * credentials in the URL, and a pending attempt this tab started. The second is
 * what keeps `detectSessionInUrl: false` meaningful — a URL alone still cannot
 * sign anybody in, only one this browser asked for a moment ago.
 */
export function GoogleReturnGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  // Decided synchronously so the page underneath never flashes first.
  const [stage, setStage] = useState<Stage>(() => (shouldFinishSignIn() ? "finishing" : "idle"));
  const [error, setError] = useState<string | null>(null);

  // A PKCE code is single-use, and StrictMode runs effects twice in dev.
  const handled = useRef(false);

  useEffect(() => {
    if (stage !== "finishing" || handled.current) return;
    handled.current = true;

    let active = true;

    (async () => {
      // The URL wins when Supabase honoured the redirect, since it is the more
      // specific record; sessionStorage covers the case where it did not.
      const attempt = takeGoogleAttempt();
      const intent = intentFromUrl() ?? attempt?.intent ?? null;
      const next = redirectTargetFromUrl() ?? attempt?.next ?? null;

      try {
        const outcome = await completeGoogleSignIn();
        if (!active) return;

        if (outcome === "no-link") {
          setError("That sign-in didn't complete. Please try again.");
          setStage("failed");
          return;
        }

        const user = await getSessionUser();
        if (!active) return;

        const destination = decideGoogleDestination(user, intent, next);
        if (destination) {
          navigate(destination, { replace: true });
          setStage("idle");
          return;
        }
        goToApp();
      } catch (err) {
        if (!active) return;
        setError(authErrorMessage(err));
        setStage("failed");
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate, stage]);

  if (stage === "finishing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Signing you in…
        </div>
      </div>
    );
  }

  if (stage === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm text-center">
          <p className="label-eyebrow text-accent">Sign-in failed</p>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em] text-primary">
            That didn't go through.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStage("idle");
              navigate("/login", { replace: true });
            }}
            className="mt-8 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
