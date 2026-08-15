import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { AuthShell } from "./AuthShell";
import { accountLabel } from "@/hooks/use-session";
import { goToApp, signOut } from "@/lib/auth";

interface AlreadySignedInProps {
  user: User;
}

/**
 * What /login and /signup show to someone who is already signed in.
 *
 * Shown in place of the form rather than redirected away from. A visitor who
 * pressed Sign in asked a question — "am I signed in, and as whom?" — and a
 * silent bounce to the app answers it by making the page disappear, which is
 * indistinguishable from a broken link. Naming the account and offering both
 * doors answers it, and covers the reason most people arrive here signed in:
 * they meant to reach a *different* account.
 */
export function AlreadySignedIn({ user }: AlreadySignedInProps) {
  const [leaving, setLeaving] = useState(false);

  return (
    <AuthShell
      eyebrow="Already signed in"
      title={
        <>
          You're{" "}
          <span className="font-script text-accent text-[1.15em]">good to go.</span>
        </>
      }
      intro={`This browser is signed in as ${accountLabel(user)}. There is nothing left to do here — CitePark is waiting for you.`}
      footer={
        <>
          Need a different account? Sign out first, then{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
          >
            create one
          </Link>
          .
        </>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={goToApp}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
        >
          Continue to CitePark
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true);
            try {
              await signOut();
            } finally {
              // On success the sign-out event re-renders this page as the form,
              // so this only matters when it failed.
              setLeaving(false);
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {leaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing out…
            </>
          ) : (
            "Sign out"
          )}
        </button>
      </div>
    </AuthShell>
  );
}
