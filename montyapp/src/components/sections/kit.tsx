import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReveal } from "@/hooks/use-reveal";
import { useSession } from "@/hooks/use-session";
import { goToApp } from "@/lib/auth";

/**
 * The shared furniture of the landing page.
 *
 * Every feature section is the same three moves — say what it is, show it, then
 * break it down — and before this they were three near-identical copies of the
 * markup that had already drifted apart (two different browser chromes, three
 * heading sizes). Sections now describe their content and inherit the shape.
 */

/** Which half of the palette a section is painted in. */
export type Tone = "light" | "dark";

/**
 * A line break inside a display heading, on wide screens only.
 *
 * These headings sit in a seven-column well and run within a few pixels of it,
 * which leaves the last word of the script phrase stranded on a line of its
 * own. Below `lg` the column is narrower and the natural wrap is the right one,
 * so the break disappears rather than forcing a two-word line on a phone.
 */
export function LineBreak() {
  return <span className="hidden lg:block" aria-hidden />;
}

/** Wraps children in a block that fades up when it first reaches the viewport. */
export function Reveal({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds. Staggers siblings; keep it under ~0.25s or the page feels slow. */
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * The heading block that opens a section: a small label, a display headline and
 * a lede set beside it on wide screens.
 *
 * The lede sits in its own column rather than under the headline because these
 * headlines run to two lines at display size, and a paragraph directly beneath
 * one reads as a third line of the title.
 */
export function SectionHead({
  eyebrow,
  title,
  lede,
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-12">
        <div className={lede ? "lg:col-span-7" : "lg:col-span-9"}>
          <p className={cn("label-eyebrow", tone === "dark" ? "text-accent" : "text-accent")}>
            {eyebrow}
          </p>
          <h2
            className={cn(
              "mt-4 display-lg",
              tone === "dark" ? "text-primary-foreground" : "text-primary"
            )}
          >
            {title}
          </h2>
        </div>
        {lede && (
          <p
            className={cn(
              "lg:col-span-5",
              tone === "dark" ? "lede text-primary-foreground/70" : "lede"
            )}
          >
            {lede}
          </p>
        )}
      </div>
    </Reveal>
  );
}

export interface Capture {
  src: string;
  alt: string;
  label: string;
}

interface AppWindowProps extends Capture {
  tone?: Tone;
  cropped?: boolean;
  /** For the capture in the hero: it is the page's largest paint, and deferring
      it leaves a hole where the product should be. */
  priority?: boolean;
  className?: string;
  /** Constrains the window, for a frame that shows one corner of a capture. */
  bodyClassName?: string;
  /** How the capture sits inside a constrained window. */
  imageClassName?: string;
}

/**
 * A product capture presented as a window.
 *
 * The chrome is not decoration: these are screenshots of an application, and
 * without a frame they read as flat illustrations of one. The title bar names
 * the exact surface being shown, which is also what tells a reader that the
 * captures on this page come from different parts of one product.
 *
 * `cropped` fades the bottom edge into the capture's own background, for the
 * shots that are cut off mid-list — a hard cut looks like a rendering bug, a
 * fade looks like a deliberate crop.
 *
 * This is the window on its own, with no entrance of its own: it is for callers
 * that animate the frame themselves (the hero stack) and would otherwise be
 * fighting a fade-up they did not ask for. Everywhere else wants `AppFrame`.
 */
export function AppWindow({
  src,
  alt,
  label,
  tone = "light",
  cropped = false,
  priority = false,
  className,
  bodyClassName,
  imageClassName,
}: AppWindowProps) {
  return (
    <figure
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-paper shadow-elite",
        tone === "dark" ? "border-primary-foreground/10" : "border-border",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/70 bg-paper px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
        </span>
        <span className="truncate text-xs font-medium tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className={cn("relative bg-paper", bodyClassName)}>
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className={cn("w-full", imageClassName)}
        />
        {cropped && (
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent"
            aria-hidden
          />
        )}
      </div>
    </figure>
  );
}

/** An `AppWindow` that fades up the first time it reaches the viewport. */
export function AppFrame({ className, ...capture }: AppWindowProps) {
  return (
    <Reveal className={className}>
      <AppWindow {...capture} />
    </Reveal>
  );
}

export interface Detail {
  title: string;
  body: string;
}

/**
 * The breakdown under a capture — one hairline-topped column per point.
 *
 * Two, three or four columns depending on how many points there are, so a set
 * of three never leaves a hole in a four-column grid.
 */
export function DetailGrid({
  items,
  tone = "light",
  className,
}: {
  items: readonly Detail[];
  tone?: Tone;
  className?: string;
}) {
  const columns =
    items.length % 4 === 0
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : items.length % 3 === 0
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <Reveal className={className}>
      <div className={cn("grid grid-cols-1 gap-8", columns)}>
        {items.map((item) => (
          <div
            key={item.title}
            className={tone === "dark" ? "detail-item-inverse" : "detail-item"}
          >
            <h3
              className={cn(
                "text-lg font-semibold",
                tone === "dark" ? "text-primary-foreground" : "text-primary"
              )}
            >
              {item.title}
            </h3>
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed",
                tone === "dark" ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/**
 * The one action this page is asking for.
 *
 * Someone with a session is not here to make an account, so the same button
 * takes them into the product instead. While the session is still unknown the
 * sign-up wording is the safe default — it is correct for everyone who is not
 * signed in, and /signup catches the ones who are.
 */
export function AccessCta({
  tone = "light",
  className,
  label = "Get access to CitePark",
}: {
  tone?: Tone;
  className?: string;
  label?: string;
}) {
  const { status } = useSession();
  const classes = cn(tone === "dark" ? "cta-primary-inverse" : "cta-primary", className);

  if (status === "signed-in") {
    return (
      <button type="button" onClick={goToApp} className={classes}>
        Open CitePark
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    );
  }

  return (
    <Link to="/signup" className={classes}>
      {label}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}
