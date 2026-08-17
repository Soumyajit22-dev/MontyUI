import references from "@/assets/references.png";
import { AppFrame, DetailGrid, Reveal, SectionHead, type Detail } from "@/components/sections/kit";

/**
 * The library sits under all three steps, so each point is numbered to the step
 * it serves — the same 01/02/03 the explainer uses.
 */
const pillars: readonly Detail[] = [
  {
    title: "01 · While you validate",
    body: "Prior art surfaced by a validation drops straight into the library — deduplicated, tagged, and scored against the question that found it.",
  },
  {
    title: "02 · While you write",
    body: "Cite as you draft. CitePark re-checks which references the LaTeX source actually cites and flags the ones that quietly fell out of the manuscript.",
  },
  {
    title: "03 · While you manage",
    body: "Smart collections, reading progress and a citation graph per project, so a group of five is working from one set of papers rather than five.",
  },
];

/** What the library can do. AI-backed entries are marked as such. */
const capabilities = [
  { label: "Semantic search", ai: true },
  { label: "Citation graph" },
  { label: "Smart collections" },
  { label: "Research connections", ai: true },
  { label: "Duplicate detection" },
  { label: "Reading progress" },
  { label: "Auto literature review", ai: true },
  { label: "Novelty tracking", ai: true },
];

const importPaths = ["DOI", "arXiv", "PubMed", "BibTeX", "A whole manuscript", "Your .bib files"];

const formats = ["BibTeX", "RIS", "CSL", "APA", "IEEE", "MLA", "Chicago"];

export function References() {
  return (
    <section id="references" className="scroll-mt-[68px] bg-background py-20 lg:py-28">
      <div className="container">
        <SectionHead
          eyebrow="Under all three · References"
          title={
            <>
              One library behind{" "}
              <span className="font-script text-accent text-[1.15em]">every step.</span>
            </>
          }
          lede="Paste a DOI, an arXiv id, a PubMed id or raw BibTeX — or upload a manuscript and let CitePark pull every citation out of it in one pass. Validation, the editor and your project tracking all read from that same set."
        />

        <Reveal className="mt-9">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="label-eyebrow text-forest-soft">Import from</span>
            {importPaths.map((p) => (
              <span key={p} className="chip">
                {p}
              </span>
            ))}
          </div>
        </Reveal>

        <AppFrame
          className="mt-10"
          src={references}
          alt="CitePark reference management: a saved collection of papers with an import field for DOI, arXiv, PubMed or BibTeX, export style buttons, and read-state filters"
          label="citepark — project01 / reference management"
          cropped
        />

        <DetailGrid className="mt-14" items={pillars} />

        <Reveal className="mt-14">
          <div className="grid grid-cols-1 gap-10 rounded-2xl bg-paper p-8 lg:grid-cols-12 lg:gap-14 lg:p-12">
            <div className="lg:col-span-7">
              <h3 className="label-eyebrow text-forest-soft">In the library</h3>
              <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
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
              <div className="mt-6 flex flex-wrap gap-2">
                {formats.map((f) => (
                  <span key={f} className="chip">
                    {f}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                The venue changes its house style two weeks before the deadline. Re-export the
                bibliography and carry on — there is nothing to reformat by hand.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
