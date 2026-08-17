import productAsset from "@/assets/product.png";
import validateAsset from "@/assets/validate.png";
import referencesAsset from "@/assets/references.png";
import {
  AccessCta,
  AppFrame,
  AppWindow,
  Reveal,
  type Capture,
} from "@/components/sections/kit";
import { useScrollSequence } from "@/hooks/use-scroll-sequence";

/**
 * What CitePark reads and writes. Named formats rather than borrowed logos:
 * these are the things a researcher checks for before they will try anything,
 * and every one of them is a surface the product actually has.
 */
const speaks = [
  "DOI",
  "arXiv",
  "PubMed",
  "BibTeX",
  "RIS",
  "CSL",
  "LaTeX",
  "TikZ",
  "draw.io",
  "APA · IEEE · MLA",
];

/**
 * The three surfaces the hero deals out, in the order the page argues them:
 * write, validate, keep. Each is the same shot the matching section shows in
 * full further down, so the stack reads as a trailer for the page rather than a
 * separate set of pictures.
 */
const captures: readonly Capture[] = [
  {
    src: productAsset,
    alt: "The CitePark editor: LaTeX source on the left, an AI edit shown as a diff with keep-or-undo controls, and the compiled PDF beside it",
    label: "citepark — project01 / documents",
  },
  {
    src: validateAsset,
    alt: "A CitePark validation report scoring an idea out of 100, with novelty, feasibility, impact and risk ratings and a generated literature review below",
    label: "citepark — validate / report",
  },
  {
    src: referencesAsset,
    alt: "CitePark reference management: a saved collection of papers with an import field for DOI, arXiv, PubMed or BibTeX, export style buttons, and read-state filters",
    label: "citepark — project01 / reference management",
  },
];

/**
 * The hero's capture stack.
 *
 * The window pins under the header while the page scrolls past it, and each
 * capture slides over the one before once that one is most of the way revealed
 * — so a visitor who does nothing but scroll has seen all three surfaces of the
 * product before they reach the first section that explains one.
 *
 * Without motion this is three windows, one under another. The initial inline
 * styles matter: the incoming captures have to start hidden in the markup, or
 * they are painted stacked on top of the first one for the frame between layout
 * and the first scroll pass.
 */
function CaptureStack() {
  const { trackRef, stageRef, setCard, stacked } = useScrollSequence(captures.length);

  if (!stacked) {
    return (
      <div className="mt-14 space-y-10 lg:mt-16">
        {captures.map((capture, i) => (
          <AppFrame key={capture.label} {...capture} priority={i === 0} />
        ))}
      </div>
    );
  }

  return (
    // The spacer under the stage is the scroll travel: the stage sticks for as
    // long as the track is taller than it. It has to be a sibling rather than
    // padding on the track — a sticky element is held inside its parent's
    // content box, and padding sits outside that, so a padded track pins for
    // exactly zero pixels.
    <div ref={trackRef} className="relative mt-14 lg:mt-16">
      {/* The stage is a screenful rather than the height of a capture, so the
          window sits in the middle of the viewport for the whole sequence
          instead of clinging to the header with the page empty beneath it. */}
      <div
        ref={stageRef}
        className="sticky top-[68px] flex h-[calc(100svh-68px)] items-center"
      >
        <div className="relative aspect-[3/2] max-h-full w-full sm:aspect-[16/10] lg:aspect-[5/3]">
          {captures.map((capture, i) => (
            <div
              key={capture.label}
              ref={setCard(i)}
              className="absolute inset-0 will-change-transform"
              style={{
                zIndex: i,
                ...(i > 0
                  ? { opacity: 0, transform: "translate3d(0, 16%, 0) scale(0.96)" }
                  : null),
              }}
            >
              <AppWindow
                {...capture}
                priority={i === 0}
                className="h-full"
                bodyClassName="min-h-0 flex-1"
                imageClassName="h-full object-cover object-top"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="h-[150vh]" aria-hidden />
    </div>
  );
}

/**
 * The opening ask.
 *
 * Centred and short on purpose. The old hero split the screen and spent its
 * width on a paragraph; a visitor who has never heard of CitePark needs one
 * sentence and one button, and the captures that deal out underneath do the
 * explaining that the paragraph was trying to do.
 */
export function Hero() {
  return (
    <section className="relative bg-background">
      <span className="pointer-events-none absolute inset-0 hero-glow" aria-hidden />
      <span className="pointer-events-none absolute inset-0 grain opacity-40" aria-hidden />

      <div className="container relative pb-16 pt-14 lg:pb-20 lg:pt-20">
        <Reveal className="text-center">
          <p className="pill-badge">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            The research OS
          </p>

          <h1 className="mx-auto mt-7 max-w-4xl display-xl text-primary">
            From a first question to a{" "}
            <span className="font-script text-accent text-[1.15em] leading-none">
              published paper.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl body-lg text-muted-foreground">
            CitePark tells you whether an research idea is worth the semester, writes the LaTeX beside
            you, and keeps every reference, figure and result in one tracked workspace.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <AccessCta />
            <a href="#research" className="cta-ghost">
              See how it works
            </a>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Free plan, no card. Your first validation runs in minutes.
          </p>
        </Reveal>

        <CaptureStack />
      </div>

      {/* The formats strip closes the hero rather than opening the next section:
          it answers "will this fit my workflow", which is the question the
          screenshot leaves a reader holding. */}
      <Reveal>
        <div className="border-y border-border/70 bg-paper/60">
          <div className="container flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-6">
            <span className="label-eyebrow text-forest-soft">Speaks your formats</span>
            {speaks.map((s) => (
              <span
                key={s}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/60"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
