import { Check, Minus, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Layout } from "@/components/layout/Layout";
import { PlanGrid } from "@/components/sections/Pricing";
import { ANNUAL_SAVING, ANNUAL_SAVING_PERCENT, formatRupees } from "@/lib/plans";

/** The upgrade path, spelled out — the same steps the Premium button runs. */
const steps = [
  {
    title: "Pick a plan",
    body: "Monthly or annual, and everything in Basic stays yours either way. Premium adds the parts that matter once a project turns into several.",
  },
  {
    title: "Confirm it's you",
    body: "Premium is granted to an account. Already signed in? Checkout opens straight away — we only ask for a sign-in if we don't recognise you yet.",
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

/**
 * What actually separates the two plans. A pricing page is read to answer this
 * one question, and the cards above only have room for the highlights.
 *
 * `premium: string` renders as a value rather than a tick, for the rows where
 * "yes" is not the interesting part.
 */
const comparison: {
  group: string;
  rows: { label: string; basic: string | boolean; premium: string | boolean }[];
}[] = [
    {
      group: "Projects",
      rows: [
        { label: "Active projects", basic: "1", premium: "Unlimited" },
        { label: "LaTeX editor — code and visual", basic: true, premium: true },
        { label: "Version history across documents", basic: false, premium: true },
      ],
    },
    {
      group: "Writing and research",
      rows: [
        { label: "AI drafting and edits", basic: true, premium: true },
        { label: "Literature validation", basic: true, premium: true },
        { label: "Diagrams on demand — TikZ & draw.io", basic: false, premium: true },
        { label: "Results, datasets and figure tracking", basic: false, premium: true },
      ],
    },
    {
      group: "Working together",
      rows: [
        { label: "Team workspaces and activity", basic: false, premium: true },
        { label: "Support", basic: "Community", premium: "Priority" },
      ],
    },
  ];

const faqs = [
  {
    q: "What's the difference between monthly and annual?",
    a: `Only the price and how long it runs. Monthly gives you 30 days of Premium; annual gives you 360 — twelve 30-day months — for ${formatRupees(
      ANNUAL_SAVING,
    )} less than paying month by month, which is where the ${ANNUAL_SAVING_PERCENT}% comes from. The features are identical.`,
  },
  {
    q: "What happens if I upgrade while I still have days left?",
    a: "Nothing is lost. The new term is added on top of the days you have already paid for, so switching from monthly to annual part-way through a month extends your end date rather than resetting it.",
  },
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

/** A tick, a dash, or a word — whichever the row calls for. */
function ComparisonValue({ value, muted }: { value: string | boolean; muted?: boolean }) {
  if (typeof value === "string") {
    return (
      <span className={`text-sm font-medium ${muted ? "text-muted-foreground" : "text-primary"}`}>
        {value}
      </span>
    );
  }

  return value ? (
    <>
      <Check className="h-4 w-4 text-accent" aria-hidden />
      <span className="sr-only">Included</span>
    </>
  ) : (
    <>
      <Minus className="h-4 w-4 text-muted-foreground/50" aria-hidden />
      <span className="sr-only">Not included</span>
    </>
  );
}

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

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
            <span>Secured by Razorpay</span>
            <span aria-hidden className="text-border">·</span>
            <span>UPI, cards, net banking and wallets</span>
            <span aria-hidden className="text-border">·</span>
            <span>Prices in Indian rupees</span>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="container">
          <p className="label-eyebrow text-accent">Side by side</p>
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-primary">
            What changes when you upgrade.
          </h2>

          {/* Narrow screens scroll this rather than crushing three columns. */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <caption className="sr-only">Basic and Premium features compared</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="pb-4 text-sm font-semibold text-primary">
                    Feature
                  </th>
                  <th
                    scope="col"
                    className="w-32 pb-4 text-center text-sm font-semibold text-primary"
                  >
                    Basic
                  </th>
                  <th scope="col" className="w-32 pb-4 text-center text-sm font-semibold text-accent">
                    Premium
                  </th>
                </tr>
              </thead>

              {comparison.map((section) => (
                <tbody key={section.group}>
                  <tr>
                    <th
                      scope="colgroup"
                      colSpan={3}
                      className="pt-8 pb-3 label-eyebrow text-forest-soft"
                    >
                      {section.group}
                    </th>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="border-t border-border">
                      <th
                        scope="row"
                        className="py-4 pr-6 text-sm font-normal leading-relaxed text-primary"
                      >
                        {row.label}
                      </th>
                      <td className="py-4">
                        <span className="flex items-center justify-center">
                          <ComparisonValue value={row.basic} muted />
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center justify-center">
                          <ComparisonValue value={row.premium} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 lg:py-28">
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

      <section className="bg-background py-20 lg:py-28">
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

          <Accordion
            type="single"
            collapsible
            className="lg:col-span-8 border-t border-border"
          >
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-border">
                <AccordionTrigger className="py-6 text-left text-lg font-semibold text-primary hover:no-underline hover:text-accent">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
