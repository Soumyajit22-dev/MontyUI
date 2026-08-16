import { Link } from "react-router-dom";
import { LegalPage, Fill } from "@/components/legal/LegalPage";
import type { LegalSection } from "@/components/legal/LegalPage";
import {
  APP_HOST,
  LEGAL_ADDRESS,
  LEGAL_CITY,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
  LEGAL_UPDATED,
  REFUND_WINDOW_DAYS,
  SITE_HOST,
} from "@/lib/legal";
import { PREMIUM_PRICING, formatRupees } from "@/lib/plans";

const mailto = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

/**
 * The terms of service.
 *
 * Prices and term lengths are read from lib/plans.ts rather than typed out, for
 * the reason the whole file exists: a contract quoting ₹299 next to a checkout
 * charging something else is a dispute waiting to be lost. Change the price in
 * one place and this page follows.
 *
 * The billing clause describes what the payment code actually does — a
 * fixed-term grant of Premium, bought outright, that stops when it runs out.
 * Nothing here should describe a recurring mandate unless and until one is
 * built, because a term promising automatic renewal to a system that cannot
 * renew is a promise to charge people in a way we do not.
 */
const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "This agreement",
    body: (
      <>
        <p>
          These Terms and Conditions are the agreement between you and{" "}
          <strong><Fill value={LEGAL_ENTITY} /></strong>, of <Fill value={LEGAL_ADDRESS} />
          ("CitePark", "we", "us"), covering the site at <code>{SITE_HOST}</code>, the application
          at <code>{APP_HOST}</code>, and everything either of them offers.
        </p>
        <p>
          By creating an account, buying Premium, or using CitePark at all, you accept these terms.
          If you do not accept them, do not use the service. Our{" "}
          <Link to="/privacy">Privacy Policy</Link> forms part of this agreement and explains how
          we handle your data.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who may use CitePark",
    body: (
      <>
        <p>
          You must be at least 18 and able to enter a binding contract. If you are using CitePark
          on behalf of a university, laboratory, company or other organisation, you confirm you are
          authorised to accept these terms for it, and "you" then means that organisation as well.
        </p>
        <p>
          You are responsible for making sure your use of CitePark is permitted by your own
          institution's policies — on research data, on confidentiality, and on the use of AI
          assistance in scholarly work.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <>
        <p>
          Give accurate details when you sign up, and keep them current. Your account is yours
          alone: keep your password to yourself, do not let anyone else sign in as you, and tell us
          at {mailto} promptly if you think someone has. You are responsible for what happens under
          your account.
        </p>
        <p>
          Signing in on <code>{SITE_HOST}</code> also signs you in on <code>{APP_HOST}</code> —
          they are one service, and one session covers both. Signing in with Google creates an
          account if you did not already have one; if the email already belongs to an account, the
          Google identity is linked to it rather than a second account being made.
        </p>
        <p>
          You can close your account at any time. What happens to your data then is set out in the{" "}
          <Link to="/privacy#retention">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "plans",
    title: "Plans",
    body: (
      <>
        <p>
          <strong>Basic</strong> is free and stays free. It includes one active project, the LaTeX
          editor in both code and visual modes, AI drafting and edits, literature validation, and
          community support. No card is required, ever, to use it.
        </p>
        <p>
          <strong>Premium</strong> is paid and adds unlimited projects, diagram generation (TikZ
          and draw.io), tracking for results, datasets and figures, team workspaces, version history
          across documents, and priority support.
        </p>
        <p>
          Which features sit in which plan is described on the{" "}
          <Link to="/pricing">pricing page</Link>, and may change as the product develops. We will
          not remove a material feature from a paid plan during a term you have already paid for.
        </p>
      </>
    ),
  },
  {
    id: "billing",
    title: "Payment and billing",
    body: (
      <>
        <p>
          Premium is sold in fixed terms, in Indian rupees, through Razorpay:
        </p>
        <ul>
          <li>
            <strong>Monthly</strong> — {formatRupees(PREMIUM_PRICING.monthly.total)} for{" "}
            {PREMIUM_PRICING.monthly.termDays} days of Premium.
          </li>
          <li>
            <strong>Annual</strong> — {formatRupees(PREMIUM_PRICING.annual.total)} for{" "}
            {PREMIUM_PRICING.annual.termDays} days, which is twelve {PREMIUM_PRICING.monthly.termDays}
            -day months.
          </li>
        </ul>
        <p>
          <strong>Premium does not renew automatically.</strong> Each payment buys a term of a
          stated length, and when it runs out your account returns to Basic until you choose to buy
          another. Nothing is charged to you again unless you go through checkout again. If you buy
          while a term is still running, the new days are added to the end of it rather than
          replacing what you have already paid for.
        </p>
        <p>
          The price you are charged is calculated on our server from the plan you selected, not
          from anything the browser sends. Payment is taken by Razorpay, who collect your card, UPI
          or banking details directly — we never see them. Premium is granted only once we have
          verified the payment signature; if verification fails, no access is granted and any
          amount debited is returned by the payment provider.
        </p>
        <p>
          Prices may change, and any change applies only to terms bought after it. Amounts are
          exclusive of taxes unless stated otherwise, and you are responsible for any taxes or bank
          charges applied at your end.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds",
    body: (
      <>
        <p>
          <strong>
            If Premium is not what you expected, write to us within {REFUND_WINDOW_DAYS} days of
            payment and we will refund it in full.
          </strong>{" "}
          Send the payment reference shown at checkout to {mailto}. We do not ask for a reason.
        </p>
        <p>
          Once refunded, Premium ends and the account returns to Basic — your work is untouched,
          but the Premium-only features stop. Refunds are made to the original payment method
          through Razorpay and usually reach you within 5–10 working days, depending on your bank.
        </p>
        <p>
          After {REFUND_WINDOW_DAYS} days a term is non-refundable and cannot be part-refunded for
          unused days. That said: if you were charged twice, charged after a failed payment, or
          charged in a way that was clearly our error, tell us at any point and we will put it
          right. Nothing here limits any right you have under consumer protection law.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your work stays yours",
    body: (
      <>
        <p>
          You keep every right you have in what you put into CitePark — your projects, documents,
          data, figures and prompts. We claim no ownership of them, and we do not publish, sell or
          license them to anyone.
        </p>
        <p>
          To run the service we need your permission to do the obvious mechanical things with that
          content: store it, back it up, transmit it, render it on your screen, compile it, and pass
          the relevant part to an AI model provider when you ask for a draft, an edit, a diagram or
          a validation. You grant us a worldwide, non-exclusive, royalty-free licence to do exactly
          that, for as long as you keep the content on CitePark and for no other purpose. It ends
          when you delete the content or close your account.
        </p>
        <p>
          You are responsible for having the right to upload what you upload, and for keeping your
          own copies of anything you cannot afford to lose.
        </p>
      </>
    ),
  },
  {
    id: "ai-output",
    title: "AI output, and what you must check",
    body: (
      <>
        <p>
          CitePark's AI features are assistance, not authorship. They can be wrong, and they can be
          wrong convincingly:
        </p>
        <ul>
          <li>
            <strong>Check every citation.</strong> Language models can produce references that look
            entirely plausible and do not exist, or attach a real author to a paper they never
            wrote. Verify anything CitePark suggests against the actual source before it goes into
            a submission.
          </li>
          <li>
            <strong>Check the substance.</strong> Generated text, LaTeX, diagrams and validations
            may contain factual, mathematical or logical errors.
          </li>
          <li>
            <strong>Check what you are allowed to submit.</strong> Journals, conferences,
            supervisors and universities have their own rules on AI assistance and disclosure.
            Complying with them is your responsibility, not ours.
          </li>
        </ul>
        <p>
          You remain the author of your work and are accountable for everything you submit under
          your name. We provide no warranty that AI output is accurate, complete, original or fit
          for any particular purpose, and we are not responsible for the academic, professional or
          legal consequences of using it unchecked.
        </p>
        <p>
          Similar output may be generated for other users from similar prompts, and we make no
          claim of exclusivity over it.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>Do not use CitePark to:</p>
        <ul>
          <li>
            fabricate research — inventing data, results or citations, or presenting generated
            material in a way intended to deceive a reader, reviewer or examiner;
          </li>
          <li>infringe copyright, or upload work you have no right to use;</li>
          <li>
            break the law, or breach a confidentiality obligation, ethics approval or data
            protection duty you are under;
          </li>
          <li>
            upload malware, attack or probe our systems, evade rate or usage limits, or attempt to
            reach data belonging to another account;
          </li>
          <li>
            scrape the service, or use automation against it beyond any API we have documented;
          </li>
          <li>
            resell, sublicense or white-label CitePark, or share one account across a group to
            avoid buying access;
          </li>
          <li>
            reverse engineer or decompile the service except to the extent the law expressly
            permits.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "our-rights",
    title: "Our intellectual property",
    body: (
      <>
        <p>
          CitePark — the software, the interface, the name, the logo and everything else we built —
          belongs to us and our licensors. These terms give you a limited, personal, non-exclusive,
          non-transferable right to use the service while your account is in good standing, and
          nothing more. Feedback you send us we may use freely, with no obligation to you.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <>
        <p>
          Parts of CitePark depend on services we do not run — Razorpay for payments, Google for
          sign-in, our hosting and AI providers, and the diagram and LaTeX toolchains. Your use of
          those is also subject to their own terms, and an outage or change on their side can
          affect CitePark. We choose them carefully but we do not control them.
        </p>
      </>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes",
    body: (
      <>
        <p>
          We work to keep CitePark available and improving, but we do not promise uninterrupted
          service. Maintenance, faults and dependencies outside our control can all interrupt it,
          and features may be added, changed or withdrawn as the product develops. Where a change
          materially reduces what a paid plan offers, we will tell you in advance and, if you would
          rather not continue, refund the unused part of your current term.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <>
        <p>
          You may stop using CitePark and close your account at any time. We may suspend or close
          an account that breaches these terms, that is being used to harm the service or other
          users, or where we are legally required to. Except in serious cases we will warn you
          first and give you a chance to put it right, and if we close a paid account for a reason
          that is not your breach, we will refund the unused part of the term.
        </p>
        <p>
          On closure your right to use the service ends. Give yourself time to export anything you
          want to keep — see the <Link to="/privacy#retention">Privacy Policy</Link> for how long
          data is retained afterwards.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <>
        <p>
          Except where the law says otherwise, CitePark is provided "as is" and "as available", and
          we disclaim all implied warranties, including merchantability, fitness for a particular
          purpose and non-infringement. We do not warrant that the service will be error-free, that
          results will meet your requirements, or that AI-generated content will be accurate.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, we are not liable for indirect, incidental,
          special or consequential loss, or for lost profits, lost data, lost time, or a rejected,
          delayed or retracted publication.
        </p>
        <p>
          Our total liability arising out of or relating to CitePark, however it arises, is limited
          to the amount you paid us in the twelve months before the event giving rise to the claim
          — or {formatRupees(PREMIUM_PRICING.monthly.total)} if you have paid us nothing.
        </p>
        <p>
          Nothing in these terms excludes liability that cannot lawfully be excluded, including for
          fraud, or for death or personal injury caused by negligence.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <>
        <p>
          You agree to indemnify us against claims, losses and reasonable legal costs arising from
          your breach of these terms, your misuse of the service, or content you uploaded that you
          had no right to upload.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    body: (
      <>
        <p>
          These terms are governed by the laws of India. The courts at{" "}
          <Fill value={LEGAL_CITY} /> have exclusive jurisdiction over any dispute arising from
          them.
        </p>
        <p>
          Before that, please write to {mailto}. Nearly everything that reaches a lawyer could have
          been settled by an email, and we would rather have the email.
        </p>
      </>
    ),
  },
  {
    id: "general",
    title: "General",
    body: (
      <>
        <p>
          These terms, together with the <Link to="/privacy">Privacy Policy</Link>, are the whole
          agreement between us. If a clause is found unenforceable, the rest stands. Our not
          enforcing something on one occasion does not waive it. You may not transfer your rights
          under these terms without our consent; we may transfer ours in a merger or reorganisation
          of the business.
        </p>
        <p>
          We may update these terms as the service changes. The date at the top moves when they do,
          and material changes will be notified by email or in the application before they take
          effect. Continuing to use CitePark after that is acceptance of the updated terms.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>
          Questions about these terms, a payment, or anything else — write to {mailto}.
        </p>
        <p>
          <Fill value={LEGAL_ENTITY} />
          <br />
          <Fill value={LEGAL_ADDRESS} />
        </p>
      </>
    ),
  },
];

const Terms = () => (
  <LegalPage
    eyebrow="Terms and Conditions"
    title="The agreement, in words you can"
    script="actually read."
    intro={
      <>
        These are the terms you accept by using CitePark. They cover what you can expect from us,
        what we expect from you, how Premium is paid for and refunded, and who owns what — your
        research stays yours throughout.
      </>
    }
    updated={LEGAL_UPDATED}
    sections={sections}
    sibling={{ label: "Read the Privacy Policy", to: "/privacy" }}
  />
);

export default Terms;
