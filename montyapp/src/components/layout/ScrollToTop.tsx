import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Starts every route at the top.
 *
 * A browser resets scroll on a real navigation; react-router does not, because
 * nothing navigates — it swaps the elements under a document that keeps its
 * scroll position. That shows worst on the links into /pricing, which are all
 * near the bottom of a long landing page (the nav, the footer, and "See
 * everything in both plans"): the pricing page is far shorter, so the carried
 * position is clamped to its height and the visitor arrives at the FAQ having
 * never seen the plans.
 *
 * Two details that are easy to get wrong:
 *
 *   `behavior: "instant"` — index.css sets `scroll-behavior: smooth` on <html>,
 *   which would otherwise animate this correction. The visitor would watch the
 *   page slide up from wherever the old route had left it, which looks more
 *   broken than the bug being fixed. This has to be a jump, not a scroll.
 *
 *   The hash guard — a URL carrying an anchor is asking for a specific section,
 *   and the browser is already scrolling there. Overriding that would break
 *   every /#research-style link in the nav.
 *
 * useLayoutEffect rather than useEffect so the jump happens before the browser
 * paints, leaving no frame of the new page at the old offset.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}
