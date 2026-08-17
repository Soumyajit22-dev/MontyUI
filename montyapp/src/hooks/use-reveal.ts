import { useEffect, useRef } from "react";

/**
 * Fades a block up the first time it reaches the viewport.
 *
 * The observer is disconnected on the first intersection: this is an entrance,
 * not a state — a block that scrolls back off screen has already been read, and
 * re-animating it on the way back up is the thing that makes scroll animation
 * feel cheap.
 *
 * The visible state is set through a data attribute rather than React state so
 * the fade is pure CSS (see `.reveal` in index.css) and costs no re-render. A
 * block already on screen at mount intersects immediately, which is what makes
 * the top of the page animate in on load without a separate code path.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer (or reduced motion) has to mean visible, never hidden —
    // failing closed here would leave the page blank.
    if (typeof IntersectionObserver === "undefined") {
      el.dataset.revealed = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.revealed = "true";
        observer.disconnect();
      },
      // A sliver is enough: waiting for a quarter of a tall section leaves the
      // top of it visible and still faded while the reader is already there.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
