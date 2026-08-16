import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { isPlaceholder } from "@/lib/legal";

export interface LegalSection {
  /**
   * The anchor this clause is linked to by. Worth choosing carefully: these end
   * up pasted into support replies and, occasionally, into a dispute, so they
   * should survive the section being renumbered or reworded.
   */
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  /** Plain, so it can be read at a glance — the flourish goes in `script`. */
  title: string;
  /** The handwritten half of the heading, as the rest of the site sets it. */
  script: string;
  /** One paragraph in plain words, before the clauses start. */
  intro: ReactNode;
  updated: string;
  sections: LegalSection[];
  /** The other document, linked at the foot — they are read as a pair. */
  sibling: { label: string; to: string };
}

/**
 * A value that may not have been written yet.
 *
 * An unfilled placeholder is marked rather than hidden: a Terms page that names
 * no company is unenforceable, and the failure mode of hiding it is that the
 * page looks finished. The dotted underline disappears the moment the constant
 * in lib/legal.ts is filled in.
 */
export function Fill({ value }: { value: string }) {
  if (!isPlaceholder(value)) return <>{value}</>;

  return (
    <span
      title="Not filled in yet — see src/lib/legal.ts"
      className="underline decoration-accent decoration-dotted decoration-2 underline-offset-4"
    >
      {value}
    </span>
  );
}

/**
 * Tracks which clause the reader is currently in, for the contents list.
 *
 * The reading line is put just under the header rather than at the top of the
 * viewport: the navbar is fixed at 68px, so a heading scrolled to its own
 * anchor sits directly beneath it, and a line any higher would credit the
 * section above for a heading the reader can plainly see.
 *
 * The last heading above that line wins. With several short clauses on screen
 * at once — and these documents have plenty — the one most recently passed is
 * the one being read.
 *
 * A scroll listener rather than an IntersectionObserver, because the question
 * is not "what is visible" but "what was passed most recently", and an observer
 * only reports the moment of crossing: it says nothing on the frames between,
 * and nothing at all about the headings that did not move across the line. The
 * work per frame is one getBoundingClientRect per heading, rAF-throttled.
 *
 * `key` rather than the array itself in the dependencies — a caller building
 * `ids` inline hands over a new array every render, which would tear the
 * listener down and rebuild it on each one.
 */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|");
    let frame = 0;

    const measure = () => {
      frame = 0;
      const headings = sectionIds
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      if (headings.length === 0) return;

      const passed = headings.filter((el) => el.getBoundingClientRect().top <= 88);
      // Above the first heading, the first entry is still the right answer:
      // the reader is in the document, just not past anything yet.
      setActive((passed.at(-1) ?? headings[0]).id);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}

export function LegalPage({
  eyebrow,
  title,
  script,
  intro,
  updated,
  sections,
  sibling,
}: LegalPageProps) {
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <Layout>
      <section className="bg-paper pt-14 pb-12 lg:pt-20 lg:pb-16">
        <div className="container">
          <p className="label-eyebrow text-accent">{eyebrow}</p>
          <h1 className="mt-4 display-lg max-w-3xl text-primary">
            {title} <span className="font-script text-accent text-[1.15em]">{script}</span>
          </h1>
          <p className="mt-6 body-lg max-w-2xl text-muted-foreground">{intro}</p>
          <p className="mt-8 text-xs uppercase tracking-[0.18em] font-semibold text-forest-soft">
            Last updated · {updated}
          </p>
        </div>
      </section>

      <section className="bg-background py-16 lg:py-24">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contents. Hidden below lg rather than stacked above the text: on a
              phone it would be a full screen of links standing between the
              reader and the document they came for, and the clauses are a
              thumb-flick apart there anyway. */}
          <nav aria-label="Contents" className="hidden lg:block lg:col-span-4">
            <div className="sticky top-[92px]">
              <h2 className="label-eyebrow text-forest-soft">Contents</h2>
              <ol className="mt-5 space-y-2.5 border-l border-border">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      aria-current={active === s.id ? "true" : undefined}
                      className={`-ml-px flex gap-3 border-l-2 py-0.5 pl-4 text-sm transition-colors ${
                        active === s.id
                          ? "border-accent text-primary font-medium"
                          : "border-transparent text-muted-foreground hover:text-accent"
                      }`}
                    >
                      <span className="tabular-nums text-xs pt-0.5 text-accent/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="lg:col-span-8">
            <div className="space-y-14">
              {sections.map((s, i) => (
                <article key={s.id}>
                  {/* scroll-mt clears the fixed navbar; without it every anchor
                      lands with its own heading hidden behind the bar. */}
                  <h2
                    id={s.id}
                    className="scroll-mt-[92px] font-display text-2xl md:text-[1.75rem] font-semibold tracking-[-0.02em] text-primary"
                  >
                    <span className="mr-3 text-accent/50 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </h2>
                  <div className="legal-prose mt-5">{s.body}</div>
                </article>
              ))}
            </div>

            <div className="mt-16 rounded-2xl bg-paper p-8 shadow-soft">
              <p className="text-sm text-muted-foreground">
                These two documents work together — the one governs what you agree to, the other
                what happens to your data.
              </p>
              <Link
                to={sibling.to}
                className="group mt-4 inline-flex items-center gap-3 text-sm font-semibold text-accent"
              >
                {sibling.label}
                <span className="transition-transform group-hover:translate-x-1">⟶</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
