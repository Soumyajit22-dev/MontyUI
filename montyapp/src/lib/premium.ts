/**
 * The purchase is carried from checkout to the confirmation page.
 *
 * Router state alone would not survive a reload, and the confirmation page is
 * exactly the one people refresh or leave open, so it is mirrored into
 * sessionStorage — same tab only, gone when the tab closes.
 */
const PURCHASE_KEY = "citepark:premium-payment";

export interface Purchase {
  paymentId: string;
  /** "monthly" or "annual" as the server recorded it, when it said. */
  billingPeriod: string | null;
  /** ISO date Premium runs to — the server's figure, which may extend a live period. */
  premiumUntil: string | null;
}

export function rememberPurchase(purchase: Purchase): void {
  try {
    sessionStorage.setItem(PURCHASE_KEY, JSON.stringify(purchase));
  } catch {
    // Private-mode browsers refuse the write; the page falls back to router state.
  }
}

export function readPurchase(): Purchase | null {
  try {
    const raw = sessionStorage.getItem(PURCHASE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Purchase>;
    // A payment id is the one field the page cannot do without — it is what
    // proves somebody bought something in this tab.
    if (typeof parsed.paymentId !== "string") return null;

    return {
      paymentId: parsed.paymentId,
      billingPeriod: parsed.billingPeriod ?? null,
      premiumUntil: parsed.premiumUntil ?? null,
    };
  } catch {
    // Unreadable storage, or a value left by an older version of this code.
    return null;
  }
}

/** Where checkout sends a visitor once the payment is verified. */
export const PREMIUM_SUCCESS_PATH = "/premium/success";
