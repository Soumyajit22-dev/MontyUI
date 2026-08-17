import { Reveal } from "@/components/sections/kit";

/**
 * The three moves, in the order the product does them — and in the order the
 * feature sections below appear, so the page never asks a reader to hold a
 * different sequence in their head than the one they just read.
 */
const steps = [
  {
    n: "01",
    title: "Validate the idea",
    body: "Describe it in a sentence. CitePark reads the live literature around it and returns a scored verdict — novelty, feasibility, impact, risk — before you commit a semester.",
    anchor: "#validate",
    anchorLabel: "See a report",
  },
  {
    n: "02",
    title: "Write the paper",
    body: "Draft in a real LaTeX editor with an AI that has read the whole project. Sections, tables, equations and figures — every change arrives as a diff you keep or undo.",
    anchor: "#editor",
    anchorLabel: "See the editor",
  },
  {
    n: "03",
    title: "Keep it all together",
    body: "References, datasets, results, figures and versions stay tracked per project, across as many projects as you are running, for everyone working with you.",
    anchor: "#manage",
    anchorLabel: "See the workspace",
  },
];

/** The short explainer between the hero and the feature sections. */
export function Steps() {
  return (
    <section
      id="research"
      className="relative scroll-mt-[68px] overflow-hidden bg-primary py-20 text-primary-foreground lg:py-24"
    >
      <span className="pointer-events-none absolute inset-0 grain opacity-30" aria-hidden />

      <div className="container relative">
        <Reveal className="max-w-2xl">
          <p className="label-eyebrow text-accent">How it works</p>
          <h2 className="mt-4 display-lg">
            Three moves,{" "}
            <span className="font-script text-accent text-[1.15em]">one workspace.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 lg:gap-14">
          {steps.map((s, i) => (
            // Staggered by index so the row assembles left to right instead of
            // all three arriving as one block.
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="border-t border-primary-foreground/20 pt-6">
                <div className="flex items-baseline gap-4">
                  <span className="font-display text-4xl font-semibold text-accent">{s.n}</span>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] lg:text-2xl">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-primary-foreground/70">{s.body}</p>
                <a href={s.anchor} className="group link-arrow mt-5">
                  {s.anchorLabel}
                  <span className="transition-transform group-hover:translate-x-1">⟶</span>
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
