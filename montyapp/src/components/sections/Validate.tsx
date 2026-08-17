import validateReport from "@/assets/validate.png";
import {
  AppFrame,
  DetailGrid,
  LineBreak,
  SectionHead,
  type Detail,
} from "@/components/sections/kit";

/** The four scores every validation carries — the same four across the report. */
const dimensions: readonly Detail[] = [
  {
    title: "Novelty",
    body: "How much of the claim is already published. CitePark clusters the nearest prior work and tells you which part of your idea is genuinely unclaimed.",
  },
  {
    title: "Feasibility",
    body: "Whether the method survives the data, compute and time you actually have — measured against how comparable studies were resourced.",
  },
  {
    title: "Impact",
    body: "Citation trajectory of the surrounding field, venue activity, and how many groups are working nearby. A growing cluster scores above a dormant one.",
  },
  {
    title: "Risk",
    body: "The failure modes, named rather than averaged away: a fragmented literature base, an unfalsifiable claim, a benchmark that does not exist yet.",
  },
];

export function Validate() {
  return (
    <section id="validate" className="scroll-mt-[68px] bg-background py-20 lg:py-28">
      <div className="container">
        <SectionHead
          eyebrow="Step 01 · Validation"
          title={
            <>
              Find out if it holds <LineBreak />
              <span className="font-script text-accent text-[1.15em]">before you commit.</span>
            </>
          }
          lede="One sentence in, a sourced report out. CitePark indexes the live literature around your question, scores it on four dimensions, and shows its working — every number traced back to the papers it came from, so you can argue with it."
        />

        <AppFrame
          className="mt-12"
          src={validateReport}
          alt="A CitePark validation report scoring 42 out of 100 with a Conditional Go verdict, novelty, feasibility, impact and risk ratings, and a generated literature review below"
          label="citepark — validate / report"
          cropped
        />

        <DetailGrid className="mt-14" items={dimensions} />
      </div>
    </section>
  );
}
