import references from "@/assets/references.png";

// The library sits under all three stages of a project, so each pillar is
// numbered to match the corresponding step in the "How it works" section.
const pillars = [
  {
    n: "01",
    title: "Validate",
    body: "Prior art you surface while validating drops straight into the library — deduplicated, tagged, and scored against your question.",
  },
  {
    n: "02",
    title: "Edit with AI",
    body: "Cite as you write. CitePark re-checks which references the LaTeX source actually cites and flags the ones that quietly fell out.",
  },
  {
    n: "03",
    title: "Manage",
    body: "Smart collections, reading progress and a citation graph per project, so a team of five works from one source of truth.",
  },
];

const capabilities = [
  { label: "Semantic Search", ai: true },
  { label: "Citation Graph" },
  { label: "Smart Collections" },
  { label: "Research Connections", ai: true },
  { label: "Duplicate Detection" },
  { label: "Reading Progress" },
  { label: "Auto Literature Review", ai: true },
  { label: "Novelty Tracking", ai: true },
];

const formats = ["BibTeX", "RIS", "CSL", "APA", "IEEE", "MLA", "Chicago"];

export function References() {
  return (
    <section id="references" className="scroll-mt-[68px] bg-background py-20 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="label-eyebrow text-accent">Reference management</p>
            <h2 className="mt-4 display-lg text-primary">
              One library behind{" "}
              <span className="font-script text-accent text-[1.15em]">all three.</span>
            </h2>
          </div>
          <p className="lg:col-span-5 body-lg text-muted-foreground">
            Import by DOI, arXiv, PubMed or BibTeX — or pull every citation out of a manuscript in
            one pass. Validation, the editor and your project tracking all read from the same set.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-paper shadow-elite">
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
              <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
            </span>
            <span className="truncate text-xs font-medium tracking-[0.08em] text-muted-foreground">
              citepark — project01 / reference management
            </span>
          </div>
          {/* The capture is cropped mid-list, so a fade keeps the cut deliberate. */}
          <div className="relative">
            <img
              src={references}
              alt="CitePark reference management: a saved collection of papers with import by DOI or BibTeX, export style options, and read-state filters"
              loading="lazy"
              className="w-full"
            />
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-paper to-transparent"
              aria-hidden
            />
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div key={p.n} className="border-t border-border pt-5">
              <span className="font-display text-3xl text-accent/40">{p.n}</span>
              <h3 className="mt-2 text-lg font-semibold text-primary">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 rounded-2xl bg-paper p-8 lg:p-10">
          <div className="lg:col-span-7">
            <h3 className="label-eyebrow text-forest-soft">In the library</h3>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {capabilities.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-primary">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <span className="text-sm">{c.label}</span>
                  {c.ai && (
                    <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-accent">
                      AI
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h3 className="label-eyebrow text-forest-soft">Export in any style</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {formats.map((f) => (
                <span
                  key={f}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary"
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Switch the venue, re-export the bibliography. Nothing to reformat by hand.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
