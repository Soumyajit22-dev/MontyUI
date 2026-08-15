import { Link } from "react-router-dom";
import productAsset from "@/assets/product.png";
import { useSession } from "@/hooks/use-session";
import { goToApp } from "@/lib/auth";

export function Hero() {
  const { status } = useSession();
  const ctaClass =
    "rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent";

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <p className="label-eyebrow text-forest-soft">CitePark · Research OS</p>
            <h1 className="mt-5 display-xl text-primary">
              Research. Edit.
              <br />
              Manage.{" "}
              <span className="font-script text-accent text-[1.15em] leading-none">all with AI</span>
            </h1>
            <p className="mt-7 body-lg max-w-lg text-muted-foreground">
              One operating system for serious research — validate an idea, write and generate
              your paper in LaTeX, and keep every experiment, figure and document in order.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {/* Someone with an account is not here to start one. While the
                  session is still unknown the sign-up wording is the safe
                  default: it is right for every visitor who is not signed in,
                  and /signup catches the ones who are. */}
              {status === "signed-in" ? (
                <button type="button" onClick={goToApp} className={ctaClass}>
                  Open CitePark
                </button>
              ) : (
                <Link to="/signup" className={ctaClass}>
                  Start your project
                </Link>
              )}
              <a
                href="#editor"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-accent"
              >
                See the editor
                <span className="transition-transform group-hover:translate-x-1">⟶</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-primary/5" aria-hidden />
              <img
                src={productAsset}
                alt="CitePark LaTeX editor with AI-assisted document edits and live PDF preview"
                loading="lazy"
                className="relative w-full rounded-2xl border border-border/60 shadow-elite"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
