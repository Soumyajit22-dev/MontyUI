/**
 * What Premium costs and how long it lasts — the authority for both.
 *
 * These two facts have to travel together. `create-order` decides the amount
 * and `verify-payment` decides the term, and once the same plan can be sold for
 * 30 days or for 360 there is no way to keep a price in one function and a
 * duration in the other without them drifting apart. So the catalogue lives
 * here and both import it.
 *
 * Amounts are in paise, because that is what Razorpay charges in. A month is
 * 30 days throughout, which is what makes the annual term 360 rather than 365 —
 * the same rhythm `user_usage` already resets on.
 */

/** Razorpay rejects anything smaller, so catch it before spending a round trip. */
export const MIN_AMOUNT_PAISE = 100;

export const PLANS = {
  premium_monthly: {
    amount: 29_900, // ₹299
    periodDays: 30,
    interval: "monthly",
    currency: "INR",
    label: "CitePark Premium — monthly",
  },
  premium_annual: {
    // ₹2,869. ₹299 × 12 is ₹3,588, and a fifth off that is ₹2,870.40 — rounded
    // down to the rupee for a price worth printing. The saving is ₹719, which
    // is 20.04%: "save 20%" is honest, if fractionally understated.
    amount: 286_900,
    periodDays: 360, // 12 × 30
    interval: "annual",
    currency: "INR",
    label: "CitePark Premium — annual",
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];
export type BillingInterval = Plan["interval"];

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

/**
 * The plan an order was created for, read back from the notes Razorpay stored.
 *
 * `create-order` stamps the plan id server-side, so this is the payer's actual
 * purchase rather than anything the browser can assert at verification time.
 *
 * Two fallbacks, both deliberate. `premium` was the single plan sold before
 * monthly and annual were split apart, and an order created under the old name
 * must still be honoured. Anything else unrecognised resolves to the monthly
 * term: a payment has been taken by the time this is read, so the wrong answer
 * is to grant nothing — grant the shortest term and let the log say why.
 */
export function planFromNotes(notes: Record<string, string> | undefined): {
  id: PlanId;
  plan: Plan;
  recognised: boolean;
} {
  const raw = notes?.plan;
  if (isPlanId(raw)) return { id: raw, plan: PLANS[raw], recognised: true };

  const id: PlanId = "premium_monthly";
  return { id, plan: PLANS[id], recognised: raw === "premium" };
}
