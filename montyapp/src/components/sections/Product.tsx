import product from "@/assets/product.png";
import team from "@/assets/team.jpg";

const features = [
  { title: "LaTeX, generated", body: "Prompt CitePark for sections, tables, equations or a full skeleton — clean LaTeX, compiled instantly." },
  { title: "Diagrams on demand", body: "Describe a figure and get TikZ or draw.io source you can keep editing, not a flat image." },
  { title: "Code or visual", body: "Switch between the raw source and a visual editor without ever breaking the document." },
  { title: "Reviewed edits", body: "Every AI change arrives as a diff you keep or undo, hunk by hunk." },
];

export function Editor() {
  return (
    <section id="editor" className="scroll-mt-[68px] bg-primary text-primary-foreground py-20 lg:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="label-eyebrow text-accent">The editor</p>
            <h2 className="mt-4 display-lg">
              Write the paper.{" "}
              <span className="font-script text-accent text-[1.15em]">CitePark handles LaTeX.</span>
            </h2>
          </div>
          <p className="lg:col-span-5 body-lg text-primary-foreground/70">
            A full LaTeX environment with an AI collaborator that reads the whole project — source,
            figures, results — before it touches a line.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-primary-foreground/10 shadow-elite">
          <img
            src={product}
            alt="CitePark editor showing LaTeX source, AI diff suggestions and a compiled PDF preview"
            loading="lazy"
            className="w-full"
          />
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="border-t border-primary-foreground/20 pt-5">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const tracked = [
  "Validation notes & prior art",
  "Experimental resources",
  "Results & datasets",
  "Figures and diagrams",
  "Paper documents & versions",
  "Team activity across projects",
];

export function Manage() {
  return (
    <section id="manage" className="scroll-mt-[68px] bg-background py-20 lg:py-28">
      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5">
          <p className="label-eyebrow text-accent">Manage</p>
          <h2 className="mt-4 display-lg text-primary">Every project, tracked.</h2>
          <p className="mt-6 body-lg text-muted-foreground">
            CitePark keeps the whole research lifecycle in one place, across as many projects as you
            are running — so nothing lives only in someone's laptop.
          </p>
          <ul className="mt-8 space-y-3">
            {tracked.map((t) => (
              <li key={t} className="flex items-start gap-3 text-primary">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <span className="text-base">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <img
            src={team}
            alt="A research group discussing their work around a table of books and a laptop"
            loading="lazy"
            className="h-[320px] lg:h-[520px] w-full rounded-2xl object-cover shadow-soft"
          />
        </div>
      </div>
    </section>
  );
}
