/**
 * Creates the Razorpay order the checkout modal is opened against.
 *
 * Two things are decided here rather than trusted from the browser: the amount
 * (the client only names a plan, so a tampered request cannot buy Premium for
 * one rupee) and who is paying (the order carries the caller's user id, which
 * is what verify-payment later upgrades).
 */
import { json, preflight, razorpayAuthHeader } from "../_shared/http.ts";
import { adminClient, userFromRequest } from "../_shared/supabase.ts";
import { MIN_AMOUNT_PAISE, PLAN_IDS, PLANS, type PlanId, isPlanId } from "../_shared/plans.ts";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

interface CreateOrderBody {
  plan?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

interface RazorpayErrorBody {
  error?: { description?: string };
}

Deno.serve(async (req) => {
  const pre = preflight(req);
  if (pre) return pre;

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    console.error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are missing from this function's secrets.");
    return json({ error: "Payments are not configured yet." }, 500);
  }

  // No anonymous checkout: there would be no account to mark as Premium.
  const admin = adminClient();
  const user = await userFromRequest(req, admin);
  if (!user) {
    return json({ error: "Sign in before paying." }, 401);
  }

  let body: CreateOrderBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Expected a JSON body." }, 400);
  }

  const planId: PlanId | undefined = isPlanId(body.plan) ? body.plan : undefined;
  if (!planId) {
    return json({ error: `Unknown plan. Expected one of: ${PLAN_IDS.join(", ")}.` }, 400);
  }

  const plan = PLANS[planId];
  if (!Number.isInteger(plan.amount) || plan.amount < MIN_AMOUNT_PAISE) {
    console.error(`Plan "${planId}" is priced below Razorpay's ${MIN_AMOUNT_PAISE} paise minimum.`);
    return json({ error: "That plan is priced incorrectly." }, 500);
  }

  // Razorpay caps receipts at 40 characters.
  const receipt = (body.receipt ?? `rcpt_${planId}_${Date.now()}`).slice(0, 40);

  let response: Response;
  try {
    response = await fetch(RAZORPAY_ORDERS_URL, {
      method: "POST",
      headers: {
        Authorization: razorpayAuthHeader(keyId, keySecret),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.amount,
        currency: plan.currency,
        receipt,
        // Razorpay echoes notes back when the order is read, so user_id here is
        // what lets verify-payment prove the payment was this caller's.
        notes: { ...body.notes, plan: planId, user_id: user.id },
      }),
    });
  } catch (error) {
    console.error("Could not reach Razorpay:", error);
    return json({ error: "Could not reach the payment gateway. Please try again." }, 500);
  }

  const payload = (await response.json().catch(() => null)) as
    | (RazorpayOrder & RazorpayErrorBody)
    | null;

  if (!response.ok) {
    console.error("Razorpay refused the order:", response.status, payload);
    // A rejected key is a deployment problem, not something the visitor can fix.
    if (response.status === 401) {
      return json({ error: "Payment gateway credentials were rejected." }, 401);
    }
    return json({ error: payload?.error?.description ?? "Could not start the payment." }, 500);
  }

  if (!payload?.id) {
    console.error("Razorpay returned a 2xx without an order id:", payload);
    return json({ error: "Could not start the payment." }, 500);
  }

  return json({
    order_id: payload.id,
    amount: payload.amount,
    currency: payload.currency,
    description: plan.label,
  });
});
