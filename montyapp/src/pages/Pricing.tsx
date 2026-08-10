import { Layout } from "@/components/layout/Layout";
import { PlanGrid } from "@/components/sections/Pricing";

/** The upgrade path, spelled out — the same four steps the Premium button runs. */
const steps = [
  {
    title: "Pick Premium",
    body: "Everything in Basic stays yours. Premium adds the parts that matter once a project turns into several.",
  },
  {
    title: "Sign in",
    body: "Premium is granted to an account, so we ask which one to add it to before anything is charged.",
  },
  {
    title: "Pay securely",
    body: "Checkout runs on Razorpay — UPI, cards, net banking or wallets. Card details never touch CitePark.",
  },
  {
    title: "Start working",
    body: "The upgrade lands on your account the moment payment is verified, and we hand you straight to the app.",
  },
];

const faqs = [
  {
    q: "Do I need a card to start?",
    a: "No. Basic is free forever and needs nothing but an account. Card details are only asked for at Premium checkout.",
  },
  {
    q: "How is payment handled?",
    a: "Through Razorpay. The amount is set on our server, and the payment is verified there too — Premium is only granted once that check passes.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. Start on Basic for as long as you like and come back to this page when the work grows; nothing you have written is affected.",
  },
  {
    q: "Something went wrong with a payment.",
    a: "Write to imsoumyajitmondal@gmail.com with the reference shown at checkout and we will sort it out.",
  },
];

const Pricing = () => {
  return (
    <Layout>
      <section className="bg-paper py-20 lg:py-28">
        <div className="container">
          <p className="label-eyebrow text-accent">Pricing</p>
          <h1 className="mt-4 display-lg max-w-3xl text-primary">
            Spending on Academics {"   "}
            <span className="font-script text-accent text-[1.15em]">is never a waste.</span>
          </h1>
          <p className="mt-6 body-lg max-w-xl text-muted-foreground">
            Start with Free. Upgrade when you realise.
          </p>

          <PlanGrid className="mt-14" />

          <p className="mt-8 text-sm text-muted-foreground">
            Prices in Indian rupees, billed monthly. Payments are processed by Razorpay.
          </p>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="container">
          <p className="label-eyebrow text-accent">How upgrading works</p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-primary">
            Four steps, about a minute.
          </h2>

          <ol className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <li key={s.title}>
                <span className="font-display text-4xl font-semibold tracking-[-0.03em] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-paper py-20 lg:py-28">
        <div className="container grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="label-eyebrow text-accent">Questions</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-primary">
              Before you pay.
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Anything else, write to{" "}
              <a
                href="mailto:imsoumyajitmondal@gmail.com"
                className="font-medium text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
              >
                imsoumyajitmondal@gmail.com
              </a>
              .
            </p>
          </div>

          <dl className="lg:col-span-8 divide-y divide-border border-t border-border">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <dt className="text-lg font-semibold text-primary">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
