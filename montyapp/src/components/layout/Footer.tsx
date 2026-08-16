import { Link } from "react-router-dom";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#research" },
      { label: "Editor", href: "/#editor" },
      { label: "References", href: "/#references" },
      { label: "Validate", href: "/#validate" },
      { label: "Manage", href: "/#manage" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Why CitePark", href: "/#why" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="font-display text-5xl lg:text-6xl font-semibold tracking-[-0.03em] text-primary-foreground/40">
              citepark<span className="text-accent">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm text-primary-foreground/70">
              The research OS. Research, edit and manage — all with AI.
            </p>
          </div>

          {columns.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h3 className="label-eyebrow text-primary-foreground/60">{c.title}</h3>
              <ul className="mt-4 space-y-3">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {/* Anchors jump within the landing page; the rest are routes. */}
                    {l.href.includes("#") ? (
                      <a href={l.href} className="text-sm hover:text-accent transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link to={l.href} className="text-sm hover:text-accent transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-3">
            <h3 className="label-eyebrow text-primary-foreground/60">Studio</h3>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Built for researchers, everywhere.
              <br />
              Find us wherever there's internet.
            </p>
            <Link
              to="/signup"
              className="mt-6 inline-block rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground transition-opacity hover:opacity-90"
            >
              Get Access
            </Link>
          </div>
        </div>

        {/* Legal sits on the bottom bar rather than in a column of its own —
            it is where people look for it, and a fourth column would not fit
            the twelve the grid above already spends. */}
        <div className="mt-14 flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} CitePark. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-primary-foreground/50">
            <Link to="/privacy" className="hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-accent transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
