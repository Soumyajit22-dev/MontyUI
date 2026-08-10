import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { getSessionUser } from "@/lib/auth";
import { PREMIUM_SUCCESS_PATH, rememberPurchase } from "@/lib/premium";
import { checkoutErrorMessage, startCheckout } from "@/lib/razorpay";

/** One shape for both CTAs so the paid one doesn't drift from the free one. */
function ctaClass(featured: boolean): string {
  return `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${featured
      ? "bg-accent text-accent-foreground hover:bg-ember-soft"
      : "bg-primary text-primary-foreground hover:bg-accent"
    }`;
}

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "forever",
    body: "Everything you need to validate an idea and write your first paper.",
    features: [
      "1 active project",
      "LaTeX editor — code and visual",
      "AI drafting and edits",
      "Literature validation",
      "Community support",
    ],
    cta: "Start for free",
    featured: false,
    paid: false,
  },
  {
    name: "Premium",
    price: "₹200",
    period: "per month",
    body: "For researchers running several projects at once, with a team beside them.",
    features: [
      "Unlimited projects",
      "Diagrams on demand — TikZ & draw.io",
      "Results, datasets and figure tracking",
      "Team workspaces and activity",
      "Version history across documents",
      "Priority support",
    ],
    cta: "Get Premium",
    featured: true,
    paid: true,
  },
];

/**
 * Opens Razorpay checkout for Premium. The price is set server-side, and so is
 * the upgrade — the payment has to land on an account, so an unrecognised
 * visitor signs in first and the checkout resumes from there.
 *
 * A paid checkout ends on the confirmation page rather than here: the hand-off
 * to the app belongs on a page of its own, where it survives being reloaded and
 * waits for the visitor instead of a timer.
 */
function PremiumCheckoutButton({ label, featured }: { label: string; featured: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const navigate = useNavigate();

  const runCheckout = async () => {
    setError(null);
    setPending(true);
    try {
      const outcome = await startCheckout("premium");
      if (outcome.status === "paid") {
        // The account is Premium by the time this resolves. Leave the button
        // spinning — this component is on its way out with the page.
        rememberPurchase(outcome.paymentId);
        navigate(PREMIUM_SUCCESS_PATH, { state: { paymentId: outcome.paymentId } });
        return;
      }
      // A dismissed modal is not a failure — leave the button as it was.
      setPending(false);
    } catch (err) {
      setError(checkoutErrorMessage(err));
      setPending(false);
    }
  };

  // The gate opens either way: signed out it asks for credentials, signed in it
  // shows which account is about to be charged.
  const pay = async () => {
    setError(null);
    const user = await getSessionUser();
    setSignedInAs(user?.email ?? null);
    setSignInOpen(true);
  };

  return (
    <div className="mt-auto">
      <button type="button" onClick={pay} disabled={pending} className={ctaClass(featured)}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening checkout…
          </>
        ) : (
          label
        )}
      </button>
      {error && (
        <p
          role="alert"
          className={`mt-4 text-sm ${featured ? "text-primary-foreground/80" : "text-destructive"}`}
        >
          {error}
        </p>
      )}

      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onContinue={runCheckout}
        signedInAs={signedInAs}
        purpose="go Premium"
      />
    </div>
  );
}

/**
 * The two plans, checkout wiring included. Lives apart from the section around
 * it so the landing page and /pricing show the same cards rather than two
 * copies that drift.
 */
export function PlanGrid({ className = "" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${className}`}>
      {plans.map((p) => (
        <div
          key={p.name}
          className={
            p.featured
              ? "relative flex flex-col rounded-2xl bg-primary text-primary-foreground p-8 lg:p-10 shadow-elite"
              : "relative flex flex-col rounded-2xl border border-border bg-background p-8 lg:p-10 shadow-soft"
          }
        >
          {p.featured && (
            <span className="absolute right-8 top-8 lg:right-10 lg:top-10 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
              Most popular
            </span>
          )}

          <h3 className={`text-2xl font-semibold ${p.featured ? "" : "text-primary"}`}>
            {p.name}
          </h3>
          <p
            className={`mt-2 text-sm leading-relaxed ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
          >
            {p.body}
          </p>

          <div className="mt-8 flex items-baseline gap-2">
            <span
              className={`font-display text-5xl lg:text-6xl font-semibold tracking-[-0.03em] ${p.featured ? "" : "text-primary"
                }`}
            >
              {p.price}
            </span>
            <span
              className={`text-sm ${p.featured ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}
            >
              {p.period}
            </span>
          </div>

          <ul className="mt-8 mb-10 space-y-3">
            {p.features.map((f) => (
              <li
                key={f}
                className={`flex items-start gap-3 text-base ${p.featured ? "text-primary-foreground/90" : "text-primary"
                  }`}
              >
                <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {p.paid ? (
            <PremiumCheckoutButton label={p.cta} featured={p.featured} />
          ) : (
            <Link to="/signup" className={`mt-auto ${ctaClass(p.featured)}`}>
              {p.cta}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

/** The pricing block on the landing page. /pricing is the page-sized version. */
export function Pricing() {
  return (
    <section id="pricing" className="bg-paper py-20 lg:py-28">
      <div className="container">
        <p className="label-eyebrow text-accent">Pricing</p>
        <h2 className="mt-4 display-lg max-w-2xl text-primary">
          Start free. Upgrade when{" "}
          <span className="font-script text-accent text-[1.15em]">the work grows.</span>
        </h2>

        <PlanGrid className="mt-14" />

        <Link
          to="/pricing"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
        >
          See everything in both plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
