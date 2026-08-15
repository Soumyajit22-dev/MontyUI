import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { sharedSessionReady } from "@/lib/sso";

/**
 * Three states, not two. "Signed out" is a claim this site cannot make on the
 * first frame: the session may still be in the shared cookie, waiting for
 * {@link sharedSessionReady} to exchange it. Callers that collapse `loading`
 * into `signed-out` will draw a Sign in button for someone who is signed in,
 * and then take it away again.
 */
export type SessionStatus = "loading" | "signed-in" | "signed-out";

export interface SessionState {
  status: SessionStatus;
  user: User | null;
}

/**
 * How long the UI will wait on the startup reconcile before drawing what it
 * already knows.
 *
 * The reconcile can involve a token exchange, and supabase-js puts no deadline
 * on that fetch — so a stalled network would otherwise leave /login blank for
 * as long as the visitor is willing to stare at it. Giving up early is safe
 * rather than merely tolerable: the reconcile is still running, and when it
 * lands its SIGNED_IN reaches the listener below and the page corrects itself.
 * The cost of the timeout expiring is a header that starts signed-out and
 * changes; the cost of no timeout is a page that never arrives.
 */
const RECONCILE_BUDGET_MS = 2500;

/** The display name the account was signed up with, falling back to the email. */
export function accountLabel(user: User | null): string {
  if (!user) return "your account";
  const name = user.user_metadata?.full_name;
  return typeof name === "string" && name.trim() ? name.trim() : user.email ?? "your account";
}

/**
 * Whether someone is signed in on this site, kept current for as long as the
 * component is mounted.
 *
 * Events are ignored until the startup reconcile has settled. supabase-js
 * announces INITIAL_SESSION straight out of localStorage, which on a visitor
 * arriving from app.citepark.com is empty and about to be filled — acting on it
 * is exactly the flash of a wrong header this hook exists to avoid. After that
 * point every event is live, so signing out in one tab updates the others.
 */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ status: "loading", user: null });

  useEffect(() => {
    let live = true;
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;

    const apply = (user: User | null) => {
      if (live) setState({ status: user ? "signed-in" : "signed-out", user });
    };

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (settled) apply(session?.user ?? null);
    });

    // A reconcile that threw still has to release the UI, or the header stays
    // blank for the rest of the visit — as does one that is merely slow.
    const budget = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, RECONCILE_BUDGET_MS);
    });

    void Promise.race([sharedSessionReady().catch(() => undefined), budget])
      .then(() => supabase.auth.getSession())
      .then(({ data: current }) => {
        settled = true;
        apply(current.session?.user ?? null);
      });

    return () => {
      live = false;
      clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
