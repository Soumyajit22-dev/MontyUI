import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  EXISTING_ACCOUNT_PARAM,
  authErrorMessage,
  completeGoogleSignIn,
  getSessionUser,
  goToApp,
  intentFromUrl,
  isGoogleNativeAccount,
  redirectTargetFromUrl,
} from "@/lib/auth";

/**
 * Where Google drops the visitor back. It exists only to redeem the code in the
 * URL — the client has `detectSessionInUrl: false`, so nothing happens here
 * unless this page asks for it — and then to move them along.
 *
 * Two destinations: a `next` path for someone who was mid-purchase and has a
 * page to get back to, and otherwise the product app, which is where the email
 * and password flows also end.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // One redemption per visit: a PKCE code is single-use, and StrictMode runs
  // effects twice in development.
  const redeemed = useRef(false);

  useEffect(() => {
    if (redeemed.current) return;
    redeemed.current = true;

    let active = true;

    (async () => {
      // Read before redeeming — exchanging the code rewrites nothing, but the
      // navigate below drops the query string these live in.
      const next = redirectTargetFromUrl();
      const intent = intentFromUrl();

      try {
        const outcome = await completeGoogleSignIn();
        if (!active) return;

        if (outcome === "no-link") {
          setError("That sign-in didn't complete. Please try again.");
          return;
        }

        // Someone mid-purchase goes back to what they were buying, whichever
        // button they pressed — anything else loses the checkout.
        if (next) {
          navigate(next, { replace: true });
          return;
        }

        const user = await getSessionUser();
        if (!active) return;

        // They asked to sign up and the account turned out to already exist.
        // Google signed them in anyway, so this is a correction rather than a
        // failure: /login says so, and offers to carry on.
        if (intent === "signup" && user && !isGoogleNativeAccount(user)) {
          navigate(`/login?${EXISTING_ACCOUNT_PARAM}=1`, { replace: true });
          return;
        }

        goToApp();
      } catch (err) {
        if (!active) return;
        setError(authErrorMessage(err));
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <AuthShell
        eyebrow="Sign-in failed"
        title="That didn't go through."
        intro={error}
        footer={
          <>
            Prefer email and password?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              Sign in that way
            </Link>
          </>
        }
      >
        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
        >
          Back to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        Signing you in…
      </div>
    </div>
  );
};

export default AuthCallback;
