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

/** Registered name of the company that operates CitePark. */
export const LEGAL_ENTITY = "[Legal entity name]";

/** Registered office, as it appears on the incorporation certificate. */
export const LEGAL_ADDRESS = "[Registered office address]";

/**
 * Seat of the courts named in the jurisdiction clause. Ordinarily the city of
 * the registered office — a clause pointing somewhere the company has no
 * presence is the kind that gets argued over rather than relied on.
 */
export const LEGAL_CITY = "[City]";

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
 */
export const GRIEVANCE_OFFICER = "[Grievance Officer name]";

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
