import { Link, Navigate, useLocation } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { goToApp } from "@/lib/auth";
import { PREMIUM_FEATURES } from "@/lib/plans";
import { type Purchase, readPurchase } from "@/lib/premium";
import { APP_URL } from "@/lib/supabase";

/** "12 August 2027", or null for anything that isn't a date we can read. */
function formatUntil(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Where a verified payment lands. Checkout passes the reference through router
 * state; a reload loses that, so sessionStorage answers instead. With neither,
 * nobody paid in this tab — send them back to the plans rather than
 * congratulate a visitor who typed the URL.
 */
const PremiumSuccess = () => {
  const { state } = useLocation();
  const purchase = (state as Purchase | null) ?? readPurchase();

  if (!purchase?.paymentId) return <Navigate to="/pricing" replace />;

  const { paymentId, billingPeriod } = purchase;
  const until = formatUntil(purchase.premiumUntil);
  const termLabel = billingPeriod === "annual" ? "Annual" : "Monthly";

  return (
    <Layout hideFooter>
      <section className="bg-paper py-20 lg:py-28">
        <div className="container max-w-2xl">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Check className="h-7 w-7" aria-hidden />
          </span>

          <p className="mt-8 label-eyebrow text-accent">Payment received</p>
          <h1 className="mt-4 display-lg text-primary">
            Congratulations — you're{" "}
            <span className="font-script text-accent text-[1.15em]">Premium.</span>
          </h1>
          <p className="mt-6 body-lg text-muted-foreground">
            Your account is upgraded and everything below is live right now. Thank you for backing
            the work — we're glad you're here.
          </p>

          {until && (
            <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-primary">
              <span className="font-semibold">{termLabel}</span>
              <span aria-hidden className="text-border">·</span>
              <span className="text-muted-foreground">active until {until}</span>
            </p>
          )}

          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 rounded-2xl bg-background p-8 shadow-soft">
            {PREMIUM_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-primary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={goToApp}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
          >
            Go to CitePark
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Payment reference <span className="font-medium text-primary">{paymentId}</span> — keep
            it if you ever need to write to us about this purchase. You can also reach the app any
            time at{" "}
            <a
              href={APP_URL}
              className="font-medium text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              {APP_URL.replace(/^https?:\/\//, "")}
            </a>
            , or head{" "}
            <Link
              to="/"
              className="font-medium text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
            >
              back to the site
            </Link>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default PremiumSuccess;
