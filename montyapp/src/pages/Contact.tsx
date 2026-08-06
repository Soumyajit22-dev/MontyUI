import { Layout } from "@/components/layout/Layout";

const Contact = () => {
  return (
    <Layout>
      <section className="bg-background py-24 lg:py-32">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6">
            <p className="label-eyebrow text-accent">Get access</p>
            <h1 className="mt-4 display-lg text-primary">
              Tell us what you're{" "}
              <span className="font-script text-accent text-[1.15em]">working on.</span>
            </h1>
            <p className="mt-6 body-lg max-w-md text-muted-foreground">
              Monty AI is rolling out to research teams and individual authors. Reach out and we'll
              set up your workspace.
            </p>
            <a
              href="mailto:hello@montyai.com"
              className="mt-8 inline-block font-display text-2xl md:text-3xl text-primary underline decoration-accent decoration-2 underline-offset-8 hover:text-accent transition-colors"
            >
              hello@montyai.com
            </a>
          </div>

          <form
            className="lg:col-span-6 rounded-2xl bg-paper p-8 shadow-soft space-y-5"
            onSubmit={(e) => e.preventDefault()}
          >
            <div>
              <label htmlFor="name" className="label-eyebrow text-forest-soft">Name</label>
              <input
                id="name"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                placeholder="Ada Lovelace"
              />
            </div>
            <div>
              <label htmlFor="email" className="label-eyebrow text-forest-soft">Email</label>
              <input
                id="email"
                type="email"
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label htmlFor="about" className="label-eyebrow text-forest-soft">Your research</label>
              <textarea
                id="about"
                rows={5}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                placeholder="A sentence or two about your project."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent"
            >
              Request access
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
