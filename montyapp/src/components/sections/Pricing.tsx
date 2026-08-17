import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { SignInDialog } from "@/components/auth/SignInDialog";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { LineBreak, SectionHead } from "@/components/sections/kit";
import { getReconciledSessionUser } from "@/lib/auth";
import {
  ANNUAL_SAVING,
  BASIC_FEATURES,
  type BillingPeriod,
  PREMIUM_FEATURES,
  PREMIUM_PRICING,
  formatRupees,
} from "@/lib/plans";
import { PREMIUM_SUCCESS_PATH, rememberPurchase } from "@/lib/premium";
import { type PlanId, checkoutErrorMessage, startCheckout } from "@/lib/razorpay";

/**
 * One shape for both CTAs so the paid one doesn't drift from the free one.
 *
 * Full width, and sat directly under the price rather than at the foot of the
 * card: the decision a visitor came to make is "how much, and where do I click",
 * and burying the button under a twenty-line feature list makes them scroll past
 * the answer to find it. The features come after, as the justification.
 */
function ctaClass(featured: boolean): string {
  return `flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${featured
    ? "bg-accent text-accent-foreground hover:bg-ember-soft"
    : "bg-primary text-primary-foreground hover:bg-accent"
    }`;
}

/**
 * Heights the two cards share, so the price blocks and the buttons line up
 * across them. Without these the shorter description on one side lifts its CTA
 * above the other's and the row reads as broken.
 */
const BLURB_MIN_H = "min-h-[3.25rem]";
const PRICE_MIN_H = "min-h-[6.5rem]";

/**
 * Opens Razorpay checkout for Premium. The price is set server-side, and so is
 * the upgrade — the payment has to land on an account, so an unrecognised
 * visitor signs in first and the checkout resumes from there.
 *
 * A paid checkout ends on the confirmation page rather than here: the hand-off
 * to the app belongs on a page of its own, where it survives being reloaded and
 * waits for the visitor instead of a timer.
 */
function PremiumCheckoutButton({
  label,
  featured,
  planId,
}: {
  label: string;
  featured: boolean;
  planId: PlanId;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const navigate = useNavigate();

  const runCheckout = async () => {
    setError(null);
    setPending(true);
    try {
      const outcome = await startCheckout(planId);
      if (outcome.status === "paid") {
        // The account is Premium by the time this resolves. Leave the button
        // spinning — this component is on its way out with the page.
        rememberPurchase({
          paymentId: outcome.paymentId,
          billingPeriod: outcome.billingPeriod,
          premiumUntil: outcome.premiumUntil,
        });
        navigate(PREMIUM_SUCCESS_PATH, {
          state: {
            paymentId: outcome.paymentId,
            billingPeriod: outcome.billingPeriod,
            premiumUntil: outcome.premiumUntil,
          },
        });
        return;
      }
      // A dismissed modal is not a failure — leave the button as it was.
      setPending(false);
    } catch (err) {
      setError(checkoutErrorMessage(err));
      setPending(false);
    }
  };

  // Someone already signed in has nothing left to prove: they identified the
  // account when they signed in, and it is the one the charge lands on. The
  // gate is for a visitor this site does not recognise yet.
  //
  // The button goes into its pending state before the check, not after: the
  // read waits on the shared-cookie reconcile, which can take a moment on a
  // visitor arriving from the product app.
  const pay = async () => {
    setError(null);
    setPending(true);

    const user = await getReconciledSessionUser();
    if (user) {
      // runCheckout owns `pending` from here — it is the same spinner.
      await runCheckout();
      return;
    }

    setPending(false);
    setSignInOpen(true);
  };

  return (
    <div>
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
        purpose="go Premium"
      />
    </div>
  );
}

/** The price block, which is the only part of a card the toggle changes. */
function PremiumPrice({ billing }: { billing: BillingPeriod }) {
  const pricing = PREMIUM_PRICING[billing];

  return (
    // Keyed on the period so React remounts on a switch and the fade replays;
    // without it the numbers would swap in place with no acknowledgement.
    <div
      key={billing}
      className={`${PRICE_MIN_H} animate-in fade-in slide-in-from-bottom-1 duration-300`}
    >
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl lg:text-6xl font-semibold tracking-[-0.03em]">
          {formatRupees(pricing.perMonth)}
        </span>
        <span className="text-sm text-primary-foreground/60">per month</span>
      </div>

      <p className="mt-2 text-sm text-primary-foreground/70">
        {billing === "annual" ? (
          <>
            {formatRupees(pricing.total)} billed yearly — you save{" "}
            <span className="font-semibold text-accent">{formatRupees(ANNUAL_SAVING)}</span>
          </>
        ) : (
          "Billed every 30 days. Cancel any time."
        )}
      </p>
    </div>
  );
}

/** The "what you get" half of a card, below the button. */
function FeatureList({
  heading,
  features,
  featured,
}: {
  heading: string;
  features: string[];
  featured: boolean;
}) {
  return (
    <div
      className={`mt-8 border-t pt-8 ${featured ? "border-primary-foreground/15" : "border-border"}`}
    >
      <p
        className={`label-eyebrow ${featured ? "text-primary-foreground/60" : "text-forest-soft"}`}
      >
        {heading}
      </p>

      <ul className="mt-5 space-y-3">
        {features.map((f) => (
          <li
            key={f}
            className={`flex items-start gap-3 text-[0.95rem] ${featured ? "text-primary-foreground/90" : "text-primary"
              }`}
          >
            <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The two plans, checkout wiring included. Lives apart from the section around
 * it so the landing page and /pricing show the same cards rather than two
 * copies that drift — which is also why the billing toggle lives here: both
 * surfaces get it from one place.
 *
 * Annual is the opening state. It is the cheaper of the two per month, so it is
 * the honest thing to lead with; a visitor who wants to pay monthly is one
 * click away and can see exactly what that costs.
 */
export function PlanGrid({
  className = "",
  align = "center",
}: {
  className?: string;
  /** Follows the heading above it — centred on /pricing, left on the landing page. */
  align?: "left" | "center";
}) {
  const [billing, setBilling] = useState<BillingPeriod>("annual");
  const premium = PREMIUM_PRICING[billing];

  return (
    <div className={className}>
      <BillingToggle
        value={billing}
        onChange={setBilling}
        className={align === "center" ? "justify-center" : "justify-start"}
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Basic */}
        <div className="relative flex flex-col rounded-2xl border border-border bg-background p-8 lg:p-10 shadow-soft">
          <h3 className="text-2xl font-semibold text-primary">Basic</h3>
          <p className={`mt-2 text-sm leading-relaxed text-muted-foreground ${BLURB_MIN_H}`}>
            Everything you need to validate an idea and write your first paper.
          </p>

          <div className={`mt-6 ${PRICE_MIN_H}`}>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-primary">
                Free
              </span>
              <span className="text-sm text-muted-foreground">forever</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              No card, no trial clock. Stay as long as you like.
            </p>
          </div>

          <Link to="/signup" className={ctaClass(false)}>
            Start for free
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            No card required
          </p>

          <FeatureList heading="Includes" features={BASIC_FEATURES} featured={false} />
        </div>

        {/* Premium. The transparent border is not decoration: Basic carries a
            1px one, and without a match here every row inside the two cards
            sits a pixel apart — including the buttons, which are meant to line
            up exactly. */}
        <div className="relative overflow-hidden rounded-2xl border border-transparent bg-gradient-forest text-primary-foreground p-8 lg:p-10 shadow-elite">
          {/* Texture over the gradient — the flat fill reads as a block of ink
              at this size, and the grain gives it a printed surface. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 grain opacity-40" />

          <div className="relative">
            <span className="absolute right-0 top-0 rounded-full bg-accent px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
              Most popular
            </span>

            <h3 className="text-2xl font-semibold">Premium</h3>
            <p
              className={`mt-2 max-w-[22rem] text-sm leading-relaxed text-primary-foreground/70 ${BLURB_MIN_H}`}
            >
              For researchers running several projects at once, with a team beside them.
            </p>

            <div className="mt-6">
              <PremiumPrice billing={billing} />
            </div>

            <PremiumCheckoutButton label="Get Premium" featured planId={premium.planId} />
            <p className="mt-3 text-center text-xs text-primary-foreground/60">
              {billing === "annual"
                ? "One payment · 360 days of Premium"
                : "Renews every 30 days · cancel any time"}
            </p>

            <FeatureList
              heading="Everything in Basic, plus"
              features={PREMIUM_FEATURES}
              featured
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** The pricing block on the landing page. /pricing is the page-sized version. */
export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-[68px] bg-background py-20 lg:py-28">
      <div className="container">
        <SectionHead
          eyebrow="Pricing"
          title={
            <>
              Start free. <LineBreak />
              <span className="font-script text-accent text-[1.15em]">
                Pay when the work grows.
              </span>
            </>
          }
          lede="One project, the full LaTeX editor, AI drafting and Unlimited LaTex document and diagram creation cost nothing — no trial clock. Premium is for the point where you are running several projects with a group beside you."
        />

        <PlanGrid className="mt-14" align="left" />

        <Link
          to="/pricing"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8 transition-colors hover:text-accent"
        >
          See everything in both plans
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section >
  );
}
