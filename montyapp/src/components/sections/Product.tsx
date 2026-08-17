import product from "@/assets/product.png";
import team from "@/assets/team.jpg";
import { AppFrame, DetailGrid, Reveal, SectionHead, type Detail } from "@/components/sections/kit";

/** What the AI half of the editor does, in the order a draft actually needs it. */
const editorPoints: readonly Detail[] = [
  {
    title: "LaTeX, written for you",
    body: "Ask for a section, a table, an equation or a whole skeleton. What comes back is clean source in your document, compiled on the spot — not a snippet to paste.",
  },
  {
    title: "Figures you can still edit",
    body: "Describe a diagram and get TikZ or draw.io source, sized to the text block and wired to a \\ref that resolves. It stays editable, because it never became a flat image.",
  },
  {
    title: "Code or visual, same document",
    body: "Move between raw source and a visual editor whenever it suits the task. Neither view can break the other, and the compile runs beside both.",
  },
  {
    title: "Every edit is a diff",
    body: "Changes arrive marked up, hunk by hunk, with keep and undo on each one. Nothing lands in your paper that you have not looked at.",
  },
];

/** The rest of the editor, as a strip of names — small things, but the ones
    people ask about before they will move a manuscript. */
const editorExtras = [
  "Live compile",
  "PDF preview",
  "Multi-file projects",
  "Figure & asset upload",
  "Bibliography build",
  "Export",
];

/**
 * Step 02, on forest green.
 *
 * The wide capture is already in the hero, so this section frames a detail of
 * the same screen instead of repeating it — the toolbar, the marked-up diff and
 * the keep/undo controls, which is the part the copy is actually about.
 */
export function Editor() {
  return (
    <section
      id="editor"
      className="relative scroll-mt-[68px] overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28"
    >
      <span className="pointer-events-none absolute inset-0 grain opacity-30" aria-hidden />

      <div className="container relative">
        <SectionHead
          tone="dark"
          eyebrow="Step 02 · The editor"
          title={
            <>
              Write the paper.{" "}
              <span className="font-script text-accent text-[1.15em]">
                CitePark handles the LaTeX.
              </span>
            </>
          }
          lede="A full LaTeX environment with a collaborator that has read the whole project — source, figures, references, results — before it touches a line of it."
        />

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <AppFrame
            className="lg:col-span-7"
            tone="dark"
            src={product}
            alt="A close view of the CitePark editor: the Code, Visual and Edit with AI toolbar above a marked-up LaTeX diff, with Keep all and Undo all controls"
            label="citepark — editor / edit with ai"
            bodyClassName="aspect-[4/3] overflow-hidden"
            imageClassName="w-[230%] max-w-none -translate-x-[19%]"
          />

          <Reveal className="lg:col-span-5">
            <h3 className="label-eyebrow text-accent">What that feels like</h3>
            <p className="mt-4 body-lg text-primary-foreground/80">
              You describe the change. CitePark rewrites the source, fixes what the change broke —
              a label, a width, an overflowing figure — recompiles, and hands the result back as a
              diff.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/60">
              You are still the author of every line. The difference is that the twenty minutes of
              LaTeX between having the idea and seeing it typeset are gone.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {editorExtras.map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-primary-foreground/20 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-primary-foreground/70"
                >
                  {e}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <DetailGrid className="mt-16" tone="dark" items={editorPoints} />
      </div>
    </section>
  );
}

/** Everything a project accumulates, and where it lives. */
const tracked = [
  { title: "Validations", body: "Every report you have run, with the question that produced it." },
  { title: "References", body: "The project's library, and which of them the source actually cites." },
  { title: "Documents", body: "Multi-file LaTeX, figures and assets, with version history." },
  { title: "Experiments", body: "Setups, runs and the results they produced." },
  { title: "Datasets", body: "What the numbers in the paper were computed from." },
  { title: "Notes", body: "The thinking that never belongs in a manuscript but cannot be lost." },
];

/** Step 03 — the workspace, and the argument for one. */
export function Manage() {
  return (
    <section id="manage" className="scroll-mt-[68px] bg-paper py-20 lg:py-28">
      <div className="container">
        <SectionHead
          eyebrow="Step 03 · The workspace"
          title={
            <>
              Every project,{" "}
              <span className="font-script text-accent text-[1.15em]">in one piece.</span>
            </>
          }
          lede="Research falls apart in the gaps between tools — the reference manager, the shared drive, the laptop with the only copy of the script. CitePark keeps the whole lifecycle of a project in one place, across as many projects as you are running."
        />

        <div className="mt-12 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-7">
            <img
              src={team}
              alt="A research group working through a paper together around a table of books and a laptop"
              loading="lazy"
              className="h-[300px] w-full rounded-2xl object-cover shadow-elite lg:h-[520px]"
            />
          </Reveal>

          <Reveal className="lg:col-span-5">
            <h3 className="label-eyebrow text-forest-soft">Tracked per project</h3>
            <ul className="mt-6 space-y-5">
              {tracked.map((t) => (
                <li key={t.title} className="flex gap-4">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-primary">{t.title}</span> — {t.body}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
              Bring your group in and they see the same project you do — the validation it started
              from, the references behind it, and who changed what.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
