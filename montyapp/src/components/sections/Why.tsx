import { Link } from "react-router-dom";
import writer from "@/assets/writer.jpg";
import { Reveal } from "@/components/sections/kit";

/** The four things the product is really aimed at. Specific, because "saves
    time" is what every tool says and none of them mean anything by it. */
const busywork = [
  "Chasing a citation that moved journals",
  "Rebuilding the same diagram for the fourth time",
  "Hunting for the version that last compiled",
  "Reformatting a bibliography for a new venue",
];

export function Why() {
  return (
    <section
      id="why"
      className="relative scroll-mt-[68px] overflow-hidden bg-primary py-20 text-primary-foreground lg:py-28"
    >
      <span className="pointer-events-none absolute inset-0 grain opacity-30" aria-hidden />

      <div className="container relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <p className="label-eyebrow text-accent">Why we built it</p>
          <h2 className="mt-5 display-lg">
            The research is the work —{" "}
            <span className="font-script text-accent text-[1.15em]">not the busywork.</span>
          </h2>
          <p className="mt-6 max-w-lg body-lg text-primary-foreground/75">
            None of this is research, and all of it is where the week goes:
          </p>

          <ul className="mt-6 space-y-3">
            {busywork.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span className="text-sm text-primary-foreground/70">{b}</span>
              </li>
            ))}
          </ul>

          <p className="mt-7 max-w-lg text-sm leading-relaxed text-primary-foreground/60">
            CitePark absorbs it, so the hours go back into the thinking that actually moves your
            field forward. That is the whole idea.
          </p>

          <Link to="/contact" className="group link-arrow mt-8">
            Get to know us
            <span className="transition-transform group-hover:translate-x-1">⟶</span>
          </Link>
        </Reveal>

        <Reveal className="lg:col-span-6" delay={0.08}>
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={writer}
                alt="A researcher working through handwritten notes beside a tablet"
                loading="lazy"
                className="h-[300px] w-[300px] rounded-full object-cover shadow-elite lg:h-[440px] lg:w-[440px]"
              />
              {/* The ember dot: the same mark that ends the wordmark, sat over
                  the portrait so the section carries the brand at this scale. */}
              <span
                className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
                aria-hidden
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
