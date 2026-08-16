import type { PlanId } from "./razorpay";

/**
 * Premium's prices, for display only.
 *
 * What a visitor is actually charged is decided by
 * `supabase/functions/_shared/plans.ts` — the browser names a plan and the
 * server prices it, so a tampered page cannot buy Premium for a rupee. The
 * figures below have to be kept in step with that file by hand; they exist so
 * the cards can say what a plan costs before the order is created.
 */

export type BillingPeriod = "monthly" | "annual";

/** Both periods, in the order the toggle offers them. */
export const BILLING_PERIODS: readonly BillingPeriod[] = ["monthly", "annual"];

export interface PremiumPricing {
  /** What `startCheckout` is given, and what the server prices. */
  planId: PlanId;
  /** The number on the card. Annual quotes its per-month equivalent — see below. */
  perMonth: number;
  /** What actually leaves the account, and how often. */
  total: number;
  /** Days of Premium the payment buys. A month is 30 days throughout. */
  termDays: number;
}

/**
 * Annual is quoted per month rather than as its ₹2,869 total, because the two
 * states of the toggle are read as a comparison: ₹2,869 sitting where ₹299 was
 * looks like a price rise, which is the opposite of what the discount is. The
 * total is still shown, underneath, where it reads as the saving it is.
 */
export const PREMIUM_PRICING: Record<BillingPeriod, PremiumPricing> = {
  monthly: { planId: "premium_monthly", perMonth: 299, total: 299, termDays: 30 },
  annual: { planId: "premium_annual", perMonth: 239, total: 2_869, termDays: 360 },
};

/** What a year on the monthly plan would cost — the number the discount is off. */
export const ANNUAL_AT_MONTHLY_RATE = PREMIUM_PRICING.monthly.perMonth * 12;

/** Rupees kept by paying yearly. */
export const ANNUAL_SAVING = ANNUAL_AT_MONTHLY_RATE - PREMIUM_PRICING.annual.total;

/**
 * Rounded down, so the badge never claims more than the price delivers: the
 * true figure is 20.04%.
 */
export const ANNUAL_SAVING_PERCENT = Math.floor(
  (ANNUAL_SAVING / ANNUAL_AT_MONTHLY_RATE) * 100
);

/** ₹2,869 rather than ₹2869 — grouped the way Indian prices are written. */
export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function isBillingPeriod(value: unknown): value is BillingPeriod {
  return value === "monthly" || value === "annual";
}

/**
 * What each plan includes, as the cards list it.
 *
 * Here rather than beside the cards so the three places that need the list —
 * the plan grid, the comparison table on /pricing, and the confirmation page —
 * read from one copy. Premium's list is also what the confirmation page
 * congratulates people on, so a feature added in one place cannot go missing
 * from the other.
 */
export const BASIC_FEATURES = [
  "1 active project",
  "LaTeX editor — code and visual",
  "AI drafting and edits",
  "Literature validation",
  "Community support",
];

export const PREMIUM_FEATURES = [
  "Unlimited projects",
  "Diagrams on demand — TikZ & draw.io",
  "Results, datasets and figure tracking",
  "Team workspaces and activity",
  "Version history across documents",
  "Priority support",
];
