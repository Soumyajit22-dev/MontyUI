import classroom from "@/assets/classroom.jpg";
import library from "@/assets/library.jpg";
import notes from "@/assets/notes.jpg";

const steps = [
  {
    n: "01",
    title: "Validate your project",
    body: "Test the idea before you spend a semester on it. Monty scans the literature, surfaces prior art, and stress-tests your research question against what already exists.",
    image: library,
    alt: "Two researchers reading and comparing sources at a library desk",
  },
  {
    n: "02",
    title: "Edit with AI",
    body: "Write in the Monty LaTeX editor — code or visual. Generate LaTeX, build diagrams, and edit your paper programmatically or by prompt, with a live compile beside you.",
    image: notes,
    alt: "Student writing notes with a pencil beside an open textbook",
  },
  {
    n: "03",
    title: "Manage and track",
    body: "Run multiple projects at once. Validation, experimental resources, results, figures and paper docs all live in one tracked workspace.",
    image: classroom,
    alt: "Two students working through their coursework in a bright classroom",
  },
];

export function Steps() {
  return (
    <section id="research" className="bg-paper py-20 lg:py-28">
      <div className="container">
        <p className="label-eyebrow text-accent">How it works</p>
        <h2 className="mt-4 display-lg max-w-2xl text-primary">
          From a question to a{" "}
          <span className="font-script text-accent text-[1.15em]">published paper.</span>
        </h2>

        <div className="mt-14 space-y-16 lg:space-y-24">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
            >
              <div className={`lg:col-span-6 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="overflow-hidden rounded-2xl shadow-soft">
                  <img
                    src={s.image}
                    alt={s.alt}
                    loading="lazy"
                    className="h-[280px] lg:h-[380px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="lg:col-span-6">
                <span className="font-display text-5xl text-accent/40">{s.n}</span>
                <h3 className="mt-4 text-2xl md:text-3xl font-semibold text-primary tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="mt-4 body-lg text-muted-foreground max-w-lg">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
