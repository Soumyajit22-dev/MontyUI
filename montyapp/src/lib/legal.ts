/**
 * The facts both legal documents are built from.
 *
 * One copy, because /privacy and /terms have to agree: a refund window quoted
 * as seven days in one place and fourteen in the other is not a typo, it is two
 * contradictory promises to the same customer. Anything that appears in both
 * documents belongs here rather than in the prose.
 *
 * ## Before this goes live
 *
 * The values wrapped in square brackets are not written yet. They are rendered
 * with a dotted accent underline by `<Fill>` so an unfinished document is
 * obvious in the browser rather than discovered by whoever needed it in a
 * dispute — filling one in here removes the marking everywhere it appears.
 */

/**
 * The person who operates CitePark.
 *
 * Not a company. No entity has been incorporated, so there is nobody to name
 * but the individual who runs it — and under the DPDP Act that is exactly who
 * the data fiduciary is: the person who decides why and how personal data is
 * processed. Both documents say so plainly rather than borrowing the language
 * of a company that does not exist. A policy signed by a fictitious entity is
 * unenforceable against anybody, which is worse for the reader than the honest
 * version, and misdescribing yourself as a registered company is its own
 * problem with Razorpay and with consumer law.
 *
 * Full legal name as it appears on a PAN card — this is the name a refund
 * dispute or a privacy complaint would be brought against.
 *
 * ## When the company is registered
 *
 * Change this to the registered name, restore the word "registered" to
 * LEGAL_ADDRESS, and move LEGAL_UPDATED. The incorporation clause on /privacy
 * covers the handover of data to the new entity and can then be dropped.
 */
export const LEGAL_OPERATOR = "Soumyajit Mondal";

/**
 * Where post reaches the operator — a principal place of business, not a
 * registered office, since there is no register to be on.
 *
 * Still required, and not only as a courtesy: the Consumer Protection
 * (E-Commerce) Rules oblige anyone selling online to publish a contact address,
 * and Premium is sold online. A PO box or a co-working address is fine; an
 * absent one is not.
 */
export const LEGAL_ADDRESS = "Kolkata, West Bengal, India";

/**
 * Seat of the courts named in the jurisdiction clause. For an individual
 * operator this is where they actually are — a clause pointing at a city with
 * no connection to either party is the kind that gets argued over rather than
 * relied on.
 */
export const LEGAL_CITY = "Kolkata";

/**
 * Where privacy requests, grievances and legal notices are received.
 *
 * The same address /contact and the pricing FAQ already give, deliberately: a
 * legal page that routes people somewhere nothing else on the site mentions is
 * a page whose replies get missed.
 */
export const LEGAL_EMAIL = "imsoumyajitmondal@gmail.com";

/**
 * The person answerable for privacy complaints — the Grievance Officer the DPDP
 * Act requires a data fiduciary to publish contact details for.
 *
 * The operator, because in a one-person operation there is nobody else it could
 * be, and inventing a separate name for the role would be a fiction the first
 * complaint exposes. Set it to a real person's name once someone else takes it
 * on; the requirement is that whoever is named can actually answer.
 */
export const GRIEVANCE_OFFICER = LEGAL_OPERATOR;

/**
 * Shown at the top of both documents. Move it whenever the substance changes,
 * not for a typo — a date that moves without reason trains people to ignore it.
 */
export const LEGAL_UPDATED = "17 August 2026";

/** Days after payment within which Premium can be refunded in full. */
export const REFUND_WINDOW_DAYS = 7;

/** Days a grievance is answered in, as the IT Rules require it be stated. */
export const GRIEVANCE_RESPONSE_DAYS = 30;

/** The two hosts these documents cover. */
export const SITE_HOST = "citepark.com";
export const APP_HOST = "app.citepark.com";

/** Whether a value is still a placeholder rather than something written. */
export function isPlaceholder(value: string): boolean {
  return value.startsWith("[") && value.endsWith("]");
}
