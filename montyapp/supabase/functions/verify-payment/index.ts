/**
 * Confirms a checkout result really came from Razorpay, then marks the paying
 * account as Premium.
 *
 * The browser can claim anything, so three things are checked before anything
 * is granted: the signature (HMAC-SHA256 of "<order_id>|<payment_id>" keyed
 * with the key secret, which never leaves this function), the order's status
 * as Razorpay itself reports it, and that the order was created for the caller
 * — otherwise a leaked success payload would upgrade the wrong account.
 */
import { json, preflight, razorpayAuthHeader } from "../_shared/http.ts";
import { adminClient, userFromRequest } from "../_shared/supabase.ts";
import { type BillingInterval, planFromNotes } from "../_shared/plans.ts";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";

const DAY_MS = 24 * 60 * 60 * 1000;

interface VerifyBody {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

interface RazorpayOrder {
  id: string;
  status: string;
  amount: number;
  notes?: Record<string, string>;
}

async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant time so a mismatch never leaks how much of the signature was right. */
function signaturesMatch(expected: string, received: string): boolean {
  if (expected.length !== received.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return diff === 0;
}

async function fetchOrder(
  orderId: string,
  keyId: string,
  keySecret: string
): Promise<RazorpayOrder | null> {
  const response = await fetch(`${RAZORPAY_ORDERS_URL}/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: razorpayAuthHeader(keyId, keySecret) },
  });
  if (!response.ok) {
    console.error("Could not read order back from Razorpay:", orderId, response.status);
    return null;
  }
  return (await response.json()) as RazorpayOrder;
}

interface Grant {
  userId: string;
  orderId: string;
  paymentId: string;
  periodDays: number;
  interval: BillingInterval;
}

/**
 * Flips the account to Premium. The product app reads user_usage.is_pro, so
 * that is the row that matters; the Razorpay references go on the user's
 * app_metadata, which is server-writable only and rides along in the JWT.
 *
 * The new term is added to whatever is left of the current one rather than
 * replacing it. Someone on a live monthly plan who buys the annual is upgrading,
 * not forfeiting — resetting the end date to today would quietly take back the
 * days they had already paid for. Only an expired period starts from now.
 *
 * user_usage rows are created lazily by the product app, so the row this is
 * asked to update may not exist yet; the read that establishes the existing end
 * date is also what says which way to write.
 */
async function grantPremium(admin: SupabaseClient, grant: Grant): Promise<Date> {
  const { userId, orderId, paymentId, periodDays, interval } = grant;

  const { data: existing, error: readError } = await admin
    .from("user_usage")
    .select("id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw readError;

  const now = new Date();
  const currentEnd = existing?.current_period_end
    ? new Date(existing.current_period_end as string)
    : null;
  const extendFrom =
    currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
  const periodEnd = new Date(extendFrom.getTime() + periodDays * DAY_MS);

  const subscription = {
    is_pro: true,
    subscription_status: "active",
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    updated_at: now.toISOString(),
  };

  if (existing) {
    const { error } = await admin
      .from("user_usage")
      .update(subscription)
      .eq("user_id", userId);
    if (error) throw error;
  } else {
    const { error } = await admin
      .from("user_usage")
      .insert({ user_id: userId, ...subscription });
    if (error) throw error;
  }

  const { error: metadataError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      plan: "premium",
      billing_period: interval,
      premium_until: periodEnd.toISOString(),
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    },
  });
  if (metadataError) throw metadataError;

  return periodEnd;
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

  const admin = adminClient();
  const user = await userFromRequest(req, admin);
  if (!user) {
    return json({ error: "Sign in before paying." }, 401);
  }

  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Expected a JSON body." }, 400);
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return json(
      {
        verified: false,
        error:
          "razorpay_order_id, razorpay_payment_id and razorpay_signature are all required.",
      },
      400
    );
  }

  const expected = await hmacSha256Hex(`${orderId}|${paymentId}`, keySecret);
  if (!signaturesMatch(expected, signature)) {
    // Nothing is granted on a mismatch — this is either a bad relay or a forgery.
    console.warn(`Signature mismatch for order ${orderId}, payment ${paymentId}.`);
    return json({ verified: false, error: "Payment could not be verified." }, 400);
  }

  const order = await fetchOrder(orderId, keyId, keySecret);
  if (!order) {
    return json({ verified: false, error: "Payment could not be verified." }, 400);
  }

  if (order.notes?.user_id !== user.id) {
    console.warn(`Order ${orderId} belongs to ${order.notes?.user_id}, not caller ${user.id}.`);
    return json({ verified: false, error: "This payment belongs to another account." }, 403);
  }

  if (order.status !== "paid") {
    console.warn(`Order ${orderId} is "${order.status}", not paid.`);
    return json({ verified: false, error: "This payment has not completed yet." }, 400);
  }

  // The term comes from the plan the order was created for, never from the
  // request: create-order stamped it into the notes server-side, and this is
  // the copy Razorpay stored.
  const { id: planId, plan, recognised } = planFromNotes(order.notes);
  if (!recognised) {
    console.warn(
      `Order ${orderId} names plan "${order.notes?.plan}", which is not in the catalogue — granting ${planId}.`
    );
  }

  let periodEnd: Date;
  try {
    periodEnd = await grantPremium(admin, {
      userId: user.id,
      orderId,
      paymentId,
      periodDays: plan.periodDays,
      interval: plan.interval,
    });
  } catch (error) {
    // The money moved even though the upgrade did not — say so rather than
    // letting it read as a failed payment.
    console.error(`Could not upgrade ${user.id} after payment ${paymentId}:`, error);
    return json(
      {
        verified: true,
        premium: false,
        error: `Your payment went through (reference ${paymentId}) but we could not upgrade your account. Contact support with that reference.`,
      },
      500
    );
  }

  return json({
    verified: true,
    premium: true,
    order_id: orderId,
    payment_id: paymentId,
    plan: planId,
    billing_period: plan.interval,
    premium_until: periodEnd.toISOString(),
  });
});
