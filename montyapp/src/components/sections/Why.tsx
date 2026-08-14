import { Link } from "react-router-dom";
import writer from "@/assets/writer.jpg";

export function Why() {
  return (
    <section id="why" className="bg-paper py-20 lg:py-28">
      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <p className="label-eyebrow text-forest-soft">Why we do it</p>
          <h2 className="mt-5 display-lg text-primary">
            The research is the work —{" "}
            <span className="font-script text-accent text-[1.15em]">not the busywork.</span>
          </h2>
          <p className="mt-6 body-lg max-w-lg text-muted-foreground">
            Formatting, chasing references, rebuilding a diagram for the fourth time, hunting for
            the version that compiled. CitePark absorbs all of it, so the hours go back into the
            thinking that actually moves your field forward.
          </p>
          <Link
            to="/contact"
            className="group mt-8 inline-flex items-center gap-3 text-sm font-semibold text-accent"
          >
            Get to know us
            <span className="transition-transform group-hover:translate-x-1">⟶</span>
          </Link>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <div className="relative">
            <img
              src={writer}
              alt="Researcher reviewing handwritten notes beside a tablet"
              loading="lazy"
              className="h-[320px] w-[320px] lg:h-[440px] lg:w-[440px] rounded-full object-cover shadow-elite"
            />
            <span className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" aria-hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
