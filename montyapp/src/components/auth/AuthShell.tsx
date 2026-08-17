import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthShellProps {
  eyebrow: string;
  title: ReactNode;
  /** Optional — a heading that needs no gloss is better left without one. */
  intro?: string;
  children: ReactNode;
  footer: ReactNode;
}

const marks = [
  "One workspace for sources, drafts, and citations",
  "Reference capture that survives the rewrite",
  "Built for people who write with a bibliography open",
];

export function AuthShell({ eyebrow, title, intro, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Editorial panel — decorative, hidden on small screens */}
      <aside
        className="relative hidden lg:flex flex-col justify-between p-12 xl:p-16 text-primary-foreground"
        style={{ background: "var(--gradient-forest)" }}
      >
        <div className="absolute inset-0 grain opacity-40" aria-hidden="true" />

        <Link
          to="/"
          className="relative font-display text-2xl font-semibold tracking-[-0.03em] hover-fade"
        >
          citepark<span className="text-accent">.</span>
        </Link>

        <div className="relative max-w-md">
          <p className="display-lg">
            Research that keeps its{" "}
            <span className="font-script text-accent text-[1.15em]">receipts.</span>
          </p>
          <ul className="mt-10 space-y-4">
            {marks.map((mark) => (
              <li key={mark} className="flex gap-3 text-sm text-primary-foreground/75">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {mark}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} CitePark
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="lg:hidden mb-10 inline-block font-display text-2xl font-semibold tracking-[-0.03em] text-primary hover-fade"
          >
            citepark<span className="text-accent">.</span>
          </Link>

          <p className="label-eyebrow text-accent">{eyebrow}</p>
          <h1 className="mt-4 text-3xl md:text-4xl font-display font-semibold leading-[1.1] tracking-[-0.025em] text-primary">
            {title}
          </h1>
          {intro && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{intro}</p>
          )}

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-sm text-muted-foreground">{footer}</p>
        </div>
      </main>
    </div>
  );
}
