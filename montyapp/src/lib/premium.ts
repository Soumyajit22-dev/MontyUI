/**
 * The purchase reference is carried from checkout to the confirmation page.
 *
 * Router state alone would not survive a reload, and the confirmation page is
 * exactly the one people refresh or leave open, so it is mirrored into
 * sessionStorage — same tab only, gone when the tab closes.
 */
const PURCHASE_KEY = "citepark:premium-payment";

export function rememberPurchase(paymentId: string): void {
  try {
    sessionStorage.setItem(PURCHASE_KEY, paymentId);
  } catch {
    // Private-mode browsers refuse the write; the page falls back to router state.
  }
}

export function readPurchase(): string | null {
  try {
    return sessionStorage.getItem(PURCHASE_KEY);
  } catch {
    return null;
  }
}

/** Where checkout sends a visitor once the payment is verified. */
export const PREMIUM_SUCCESS_PATH = "/premium/success";
