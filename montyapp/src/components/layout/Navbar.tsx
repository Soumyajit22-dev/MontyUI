import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const links = [
  { label: "How it works", href: "/#research" },
  { label: "Editor", href: "/#editor" },
  { label: "References", href: "/#references" },
  // Research validation is the product's own word for it — one entry, not two.
  { label: "Validate", href: "/#validate" },
  { label: "Manage", href: "/#manage" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-paper transition-shadow duration-300",
        scrolled && "shadow-soft"
      )}
    >
      <div className="container flex items-center justify-between py-4 lg:py-5">
        <Link to="/" className="font-display text-2xl lg:text-[1.75rem] font-semibold tracking-[-0.03em] text-primary hover-fade">
          citepark<span className="text-accent">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => {
            const className =
              "text-sm font-medium text-primary/80 hover:text-accent transition-colors";
            // Section links are anchors on the landing page; a page of its own
            // routes client-side instead of reloading the site.
            return l.href.includes("#") ? (
              <a key={l.label} href={l.href} className={className}>
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.href} className={className}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          <Link
            to="/login"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 transition-colors hover:text-accent"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent"
          >
            Get Access
          </Link>
        </div>
      </div>
    </header>
  );
}
