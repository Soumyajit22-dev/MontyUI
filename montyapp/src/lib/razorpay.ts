import { FunctionsHttpError } from "@supabase/supabase-js";
import { getReconciledSessionUser } from "./auth";
import { supabase } from "./supabase";

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Plans priced server-side by the create-order function; this only names them. */
export type PlanId = "premium_monthly" | "premium_annual";

export type CheckoutOutcome =
  | {
      status: "paid";
      orderId: string;
      paymentId: string;
      /** What the server granted, so the confirmation can name the term. */
      billingPeriod: string | null;
      premiumUntil: string | null;
    }
  | { status: "dismissed" };

interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  description: string;
}

/** A type alias, not an interface, so it can be posted straight to the function. */
type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

interface RazorpayFailure {
  error?: { description?: string; reason?: string };
}

interface VerifyResponse {
  verified: boolean;
  premium: boolean;
  billing_period?: string;
  premium_until?: string;
}

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpaySuccess) => void;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", handler: (response: RazorpayFailure) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/**
 * checkout.js is loaded on demand rather than from index.html — most visitors
 * never open the modal, and this keeps a third-party script off every page load.
 */
let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Let a later attempt retry instead of caching the failure forever.
      scriptPromise = null;
      script.remove();
      reject(new Error("Could not load Razorpay checkout. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Edge Functions report failures as a FunctionsHttpError holding the raw
 * Response, so the readable message the function sent has to be unwrapped.
 */
async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json().catch(() => null);
      throw new Error(payload?.error ?? "Something went wrong with the payment. Please try again.");
    }
    throw new Error("Could not reach the payment service. Please try again.");
  }

  if (!data) throw new Error("The payment service returned nothing. Please try again.");
  return data;
}

/**
 * Runs the whole checkout: create the order, open the modal, verify what comes
 * back, and — on the server — mark the account Premium. Resolves "dismissed"
 * when the visitor closes the modal; rejects with a message worth showing when
 * the payment fails or cannot be verified.
 *
 * A session is required. Both functions refuse an anonymous caller anyway, but
 * failing here keeps the visitor out of a modal they cannot complete. The read
 * waits on the shared-cookie reconcile so that someone who arrived signed in
 * from the product app is not told to sign in again.
 */
export async function startCheckout(plan: PlanId): Promise<CheckoutOutcome> {
  const user = await getReconciledSessionUser();
  if (!user) throw new Error("Please sign in before paying.");

  const [order] = await Promise.all([
    invokeFunction<CreateOrderResponse>("create-order", { plan }),
    loadCheckoutScript(),
  ]);

  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    throw new Error("Could not load Razorpay checkout. Please try again.");
  }

  return new Promise<CheckoutOutcome>((resolve, reject) => {
    // payment.failed and ondismiss both fire when a failed payment is closed;
    // whichever lands first is the one that decides the outcome.
    let settled = false;
    const settle = (finish: () => void) => {
      if (settled) return;
      settled = true;
      finish();
    };

    const checkout = new Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "CitePark",
      description: order.description,
      // The payer is known by now, so nothing here needs retyping.
      prefill: {
        email: user.email,
        name: (user.user_metadata?.full_name as string | undefined) ?? undefined,
      },
      notes: { plan },
      theme: { color: "#1f1b16" },
      modal: {
        ondismiss: () => settle(() => resolve({ status: "dismissed" })),
      },
      handler: (response) => {
        // verify-payment is what actually grants Premium, so its failure is a
        // failure of the purchase even though the modal already said "success".
        invokeFunction<VerifyResponse>("verify-payment", response).then(
          (verified) =>
            settle(() =>
              resolve({
                status: "paid",
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                // The term is the server's to state, not the page's: it is the
                // end date actually written, which extends an unexpired period
                // rather than restarting it.
                billingPeriod: verified.billing_period ?? null,
                premiumUntil: verified.premium_until ?? null,
              })
            ),
          (error: Error) => settle(() => reject(error))
        );
      },
    });

    checkout.on("payment.failed", (response) => {
      settle(() =>
        reject(
          new Error(
            response.error?.description ?? "The payment did not go through. Please try again."
          )
        )
      );
    });

    checkout.open();
  });
}

export function checkoutErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
