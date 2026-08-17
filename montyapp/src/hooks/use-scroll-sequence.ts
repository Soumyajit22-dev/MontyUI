import { useCallback, useEffect, useRef, useState } from "react";

/**
 * How much of a capture has to be revealed before the next one starts arriving.
 *
 * The overlap is the whole point: at a full 1.0 the captures would queue rather
 * than hand off, and the reader would sit through a still frame between each
 * one. At 0.7 the next window is already on its way in a good while before the
 * current one has finished arriving.
 */
const HANDOFF = 0.7;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Ease-out cubic: fast on arrival, settling rather than stopping. */
const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * Drives a stack of captures from the scroll position.
 *
 * The shape it expects is a tall `track` with a `sticky` `stage` inside it: the
 * stage pins while the track scrolls past, and how far the stage has travelled
 * inside the track is the progress of the sequence. Measuring it that way —
 * rather than from `scrollY` and a hard-coded offset — means the sticky offset,
 * the track height and the height of the stack can all change in CSS without
 * this file knowing about it.
 *
 * Cards are written to directly rather than through React state. This runs on
 * every scroll frame, and a re-render per frame for three transforms is the
 * difference between a stack that tracks the wheel and one that lags behind it.
 *
 * Reduced motion turns the whole thing off — `stacked` goes false and the
 * caller is expected to lay the same captures out one under another, because a
 * sequence that only exists inside an animation has nothing left when the
 * animation is removed.
 */
export function useScrollSequence(count: number) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const [stacked, setStacked] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStacked(!media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!stacked || count < 1) return;

    // Each capture is revealed over `span` of the track, and each one starts
    // `HANDOFF * span` after the one before it, so the last finishes exactly at
    // the end of the track.
    const span = 1 / ((count - 1) * HANDOFF + 1);

    const paint = () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;

      const trackBox = track.getBoundingClientRect();
      const stageBox = stage.getBoundingClientRect();
      const travel = trackBox.height - stageBox.height;
      const progress = travel > 0 ? clamp((stageBox.top - trackBox.top) / travel) : 1;

      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // The first capture is already there when the page loads — it is what
        // the hero is showing — so it only ever gets covered, never arrives.
        const arrive =
          i === 0 ? 1 : ease(clamp((progress - i * HANDOFF * span) / span));
        // How far the *next* capture has come over this one. Nothing follows
        // the last, so it holds at full size for the end of the track.
        const covered =
          i === count - 1
            ? 0
            : ease(clamp((progress - (i + 1) * HANDOFF * span) / span));

        // Opaque almost immediately, then it is all movement. A capture that
        // fades the whole way across leaves two screenshots readable through
        // each other, which looks like a rendering fault rather than a
        // transition; the window's own paper background is opaque, so once the
        // fade is done the arriving capture simply covers the one below and
        // that one is hidden rather than erased.
        card.style.opacity = `${Math.min(1, arrive * 5)}`;
        card.style.transform =
          `translate3d(0, ${(1 - arrive) * 16}%, 0) ` +
          `scale(${0.96 + 0.04 * arrive - 0.06 * covered})`;
      });
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        paint();
      });
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [count, stacked]);

  const setCard = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      cardsRef.current[i] = el;
    },
    []
  );

  return { trackRef, stageRef, setCard, stacked };
}
