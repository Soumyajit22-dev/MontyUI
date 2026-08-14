import validateReport from "@/assets/validate.png";

// The four dimensions every validation is scored on — the same ones shown
// across the top of the report capture below.
const dimensions = [
  {
    label: "Novelty",
    body: "How much of the idea is already published. CitePark clusters the closest prior work and tells you which part of the claim is genuinely unclaimed.",
  },
  {
    label: "Feasibility",
    body: "Whether the method can be run with the data, compute and time you actually have — judged against how comparable studies were resourced.",
  },
  {
    label: "Impact",
    body: "Citation trajectory of the surrounding field, venue activity and how many groups are working nearby. A dense, growing cluster scores higher than a dormant one.",
  },
  {
    label: "Risk",
    body: "The failure modes: a fragmented literature base, an unfalsifiable claim, a benchmark that does not exist yet. Named explicitly, not averaged away.",
  },
];

const tabs = [
  {
    name: "Overview",
    body: "The verdict in one screen — score, decision, and the two or three changes that would move it most.",
  },
  {
    name: "Report",
    body: "The long-form literature review: what the corpus actually contains, which fields it is drawn from, and whether your question maps onto an established cluster at all.",
  },
  {
    name: "Novelty",
    body: "Your claim placed against the nearest published work, sentence by sentence, with the overlap highlighted.",
  },
  {
    name: "Gaps",
    body: "The open problems the literature admits to — the honest place to aim a new project.",
  },
  {
    name: "Related Work",
    body: "A ranked, deduplicated reading list. Everything here drops into your reference library in one click.",
  },
  {
    name: "Experiments",
    body: "Concrete studies that would test the claim: setup, baselines, the measurement that would settle it.",
  },
  {
    name: "Viability",
    body: "Cost, time and dependency estimate — what it would take to actually finish the work.",
  },
];

const verdicts = [
  { band: "70–100", label: "Go", body: "Well-supported and unclaimed. Start writing." },
  { band: "40–69", label: "Conditional Go", body: "Worth doing once the scope is reframed and the literature base is aligned." },
  { band: "0–39", label: "Rethink", body: "The claim collides with published work, or nothing in the corpus can test it." },
];

export function Validate() {
  return (
    <section id="validate" className="bg-paper py-20 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="label-eyebrow text-accent">Validation with AI</p>
            <h2 className="mt-4 display-lg text-primary">
              Find out if the idea holds{" "}
              <span className="font-script text-accent text-[1.15em]">before you commit.</span>
            </h2>
          </div>
          <p className="lg:col-span-5 body-lg text-muted-foreground">
            Describe your research idea in a sentence. CitePark indexes the live literature around
            it, scores it on four dimensions, and returns a report you can argue with — every
            number traced back to the works it came from.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background shadow-elite">
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
            </span>
            <span className="truncate text-xs font-medium tracking-[0.08em] text-muted-foreground">
              citepark — validate / report
            </span>
          </div>
          {/* The capture is cropped mid-report, so a fade keeps the cut deliberate. */}
          <div className="relative">
            <img
              src={validateReport}
              alt="CitePark validation report: an overall score of 42/100 with a Conditional Go verdict, novelty, feasibility, impact and risk ratings, and a generated literature review"
              loading="lazy"
              className="w-full"
            />
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent"
              aria-hidden
            />
          </div>
        </div>

        {/* What each score is actually measuring. */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {dimensions.map((d) => (
            <div key={d.label} className="border-t border-border pt-5">
              <h3 className="text-lg font-semibold text-primary">{d.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 rounded-2xl bg-background p-8 lg:p-10">
          <div className="lg:col-span-7">
            <h3 className="label-eyebrow text-forest-soft">Seven views of one idea</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-lg">
              A validation is not a single number. Each tab answers a different question you would
              otherwise spend a month answering by hand.
            </p>
            <ul className="mt-6 space-y-4">
              {tabs.map((t) => (
                <li key={t.name} className="flex gap-4">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-primary">{t.name}</span> — {t.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h3 className="label-eyebrow text-forest-soft">Reading the verdict</h3>
            <div className="mt-6 space-y-5">
              {verdicts.map((v) => (
                <div key={v.label} className="border-t border-border pt-4">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-xl font-semibold text-primary">
                      {v.label}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {v.band}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              A low score is not a rejection. Every report ends with the specific reframings that
              would raise it — and you can re-run the validation against the revised question as
              many times as you like.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span>Saved validations stay with the project.</span>
          <a href="#editor" className="group inline-flex items-center gap-2 font-semibold text-accent">
            Write this paper
            <span className="transition-transform group-hover:translate-x-1">⟶</span>
          </a>
        </div>
      </div>
    </section>
  );
}
