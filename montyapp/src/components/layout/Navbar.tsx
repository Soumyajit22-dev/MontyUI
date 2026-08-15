import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { goToApp, signOut } from "@/lib/auth";

const links = [
  { label: "How it works", href: "/#research" },
  { label: "Editor", href: "/#editor" },
  { label: "References", href: "/#references" },
  // Research validation is the product's own word for it — one entry, not two.
  { label: "Validate", href: "/#validate" },
  { label: "Manage", href: "/#manage" },
  { label: "Pricing", href: "/pricing" },
];

const linkClass =
  "text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 transition-colors hover:text-accent";
const pillClass =
  "rounded-full bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-accent";

/**
 * The right-hand pair: an invitation to sign up, or a way back into the app.
 *
 * Nothing is drawn while the session is still being worked out. The alternative
 * is to assume signed-out and correct it a moment later, which puts a Sign in
 * button in front of people who are already signed in — and the reconcile is a
 * microtask for the anonymous visitors this would be optimising for, since only
 * an actual handoff costs a round trip.
 */
function AccountLinks() {
  const { status } = useSession();
  const [leaving, setLeaving] = useState(false);

  if (status === "loading") return null;

  if (status === "signed-in") {
    return (
      <>
        <button
          type="button"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true);
            try {
              await signOut();
            } finally {
              // The header follows the auth event rather than this flag; this
              // only releases the button if signing out failed.
              setLeaving(false);
            }
          }}
          className={cn(linkClass, "disabled:opacity-60")}
        >
          Sign out
        </button>
        <button type="button" onClick={goToApp} className={pillClass}>
          Open CitePark
        </button>
      </>
    );
  }

  return (
    <>
      <Link to="/login" className={linkClass}>
        Sign in
      </Link>
      <Link to="/signup" className={pillClass}>
        Get Access
      </Link>
    </>
  );
}

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
          <AccountLinks />
        </div>
      </div>
    </header>
  );
}
