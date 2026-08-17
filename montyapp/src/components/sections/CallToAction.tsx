import { Link } from "react-router-dom";
import { AccessCta, Reveal } from "@/components/sections/kit";

/**
 * The closing ask.
 *
 * The hero asks a visitor to sign up before they know what CitePark is; this
 * asks the ones who read the whole page, which is the more likely conversion of
 * the two. Same button, same wording — a second, different-looking call to
 * action would read as a different offer.
 */
export function CallToAction() {
  return (
    <section className="relative overflow-hidden bg-gradient-forest py-20 text-primary-foreground lg:py-28">
      <span className="pointer-events-none absolute inset-0 grain opacity-40" aria-hidden />

      <Reveal>
        <div className="container relative text-center">
          <p className="label-eyebrow text-accent">Get started</p>
          <h2 className="mx-auto mt-5 max-w-3xl display-lg">
            Bring us the question you have been{" "}
            <span className="font-script text-accent text-[1.15em]">circling for months.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl body-lg text-primary-foreground/75">
            Make an account, describe the idea in a sentence, and read what the literature already
            says about it. That is the whole first session.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <AccessCta tone="dark" />
            <Link to="/pricing" className="cta-ghost-inverse">
              Compare plans
            </Link>
          </div>

          <p className="mt-5 text-sm text-primary-foreground/60">
            Free forever plan · no card required · cancel Premium any time
          </p>
        </div>
      </Reveal>
    </section>
  );
}
