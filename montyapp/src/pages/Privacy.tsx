import { Link } from "react-router-dom";
import { LegalPage, Fill } from "@/components/legal/LegalPage";
import type { LegalSection } from "@/components/legal/LegalPage";
import {
  APP_HOST,
  GRIEVANCE_OFFICER,
  GRIEVANCE_RESPONSE_DAYS,
  LEGAL_ADDRESS,
  LEGAL_EMAIL,
  LEGAL_ENTITY,
  LEGAL_UPDATED,
  SITE_HOST,
} from "@/lib/legal";

/** The address, written once — it appears in the opening clause and the last. */
const mailto = <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>;

/**
 * The privacy policy, written from what the code actually does.
 *
 * Every factual claim below is traceable to something in this repository —
 * the SSO cookie in lib/sso.ts, the columns verify-payment writes, the fields
 * create-order stamps on an order. That is the point: a privacy policy
 * describing a system that does not exist is worse than none, because it is a
 * statement the company can be held to and cannot honour.
 *
 * Which means it goes stale the moment the product does. Anything that changes
 * what is collected, who it is shared with, or how long it is kept needs the
 * matching clause updated and LEGAL_UPDATED moved.
 */
const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          CitePark is a research operating system — a workspace for validating a research
          question, writing and generating LaTeX documents with AI assistance, and keeping the
          experiments, references, figures and drafts behind a paper in one place.
        </p>
        <p>
          The service is operated by <strong><Fill value={LEGAL_ENTITY} /></strong>, registered
          at <Fill value={LEGAL_ADDRESS} /> ("CitePark", "we", "us"). Under India's Digital
          Personal Data Protection Act, 2023 we are the <strong>data fiduciary</strong> for the
          personal data described here — we decide why and how it is processed, and we are
          answerable for it.
        </p>
        <p>
          This policy covers the marketing site at <code>{SITE_HOST}</code> and the product
          application at <code>{APP_HOST}</code>. They are one service on two hosts and share one
          account system, so one policy governs both.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect",
    body: (
      <>
        <h3>Information you give us</h3>
        <ul>
          <li>
            <strong>Account details.</strong> Your email address and a password, or — if you sign
            in with Google — the name, email address and profile picture Google returns for that
            account. We never receive your Google password.
          </li>
          <li>
            <strong>Your research content.</strong> Projects, LaTeX documents and their revision
            history, references and bibliographies, uploaded datasets and figures, diagrams, and
            the prompts and instructions you give the AI features.
          </li>
          <li>
            <strong>What you write to us.</strong> The contents of support emails and anything you
            send through the contact form, including whatever you choose to put in it.
          </li>
        </ul>

        <h3>Information created when you use CitePark</h3>
        <ul>
          <li>
            <strong>Account state.</strong> Which plan you are on, whether Premium is active, and
            the dates the current term runs between.
          </li>
          <li>
            <strong>Payment records.</strong> When you buy Premium we store the Razorpay order and
            payment identifiers, the plan and billing period you chose, and the date your access
            runs to. <strong>We never receive or store your card number, CVV, UPI PIN or bank
            credentials</strong> — those are entered on Razorpay's checkout and stay with
            Razorpay.
          </li>
          <li>
            <strong>Technical and usage data.</strong> IP address, browser and device type, pages
            and features used, timestamps, and error diagnostics. This is the ordinary log data any
            hosted service produces, and we use it to keep the service working and secure.
          </li>
        </ul>

        <h3>What we do not collect</h3>
        <p>
          We do not run advertising or third-party analytics trackers, we do not buy personal data
          from data brokers, and we do not build advertising profiles. We ask for no data that the
          feature you are using does not need.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and browser storage",
    body: (
      <>
        <p>
          CitePark sets no advertising or tracking cookies. What it does store in your browser is
          the machinery of staying signed in, and it is listed in full:
        </p>
        <div className="legal-table">
          <table>
            <caption className="sr-only">Cookies and browser storage used by CitePark</caption>
            <thead>
              <tr>
                <th scope="col">What</th>
                <th scope="col">Why</th>
                <th scope="col">How long</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>citepark-sso</code> cookie, set on <code>.{SITE_HOST}</code>
                </td>
                <td>
                  Carries your session between <code>{SITE_HOST}</code> and <code>{APP_HOST}</code>{" "}
                  so signing in once is enough. It holds a refresh token — not your password.
                </td>
                <td>30 days, or until you sign out</td>
              </tr>
              <tr>
                <td>Local storage (Supabase session)</td>
                <td>Keeps you signed in between visits on this device.</td>
                <td>Until you sign out or clear your browser</td>
              </tr>
              <tr>
                <td>Session storage</td>
                <td>
                  Holds a purchase reference so the confirmation page survives a reload, and a
                  short-lived note of a sign-in in progress.
                </td>
                <td>Until the tab is closed</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          All of it is strictly necessary to provide the service you asked for. You can clear it
          from your browser at any time; the effect is that you will be signed out.
        </p>
      </>
    ),
  },
  {
    id: "why-we-use-it",
    title: "Why we use it, and on what basis",
    body: (
      <>
        <p>We process personal data only for these purposes:</p>
        <div className="legal-table">
          <table>
            <caption className="sr-only">Purposes and legal bases for processing</caption>
            <thead>
              <tr>
                <th scope="col">Purpose</th>
                <th scope="col">Basis</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Creating and running your account, and keeping you signed in across both hosts</td>
                <td>Performance of our contract with you; your consent when you sign up</td>
              </tr>
              <tr>
                <td>
                  Storing your projects and documents, and producing the drafts, edits, diagrams
                  and validations you ask the AI features for
                </td>
                <td>Performance of our contract with you</td>
              </tr>
              <tr>
                <td>Taking payment, granting Premium, and issuing refunds</td>
                <td>Performance of our contract; compliance with tax and accounting law</td>
              </tr>
              <tr>
                <td>Keeping the service available, diagnosing faults, preventing abuse and fraud</td>
                <td>Our legitimate interest in a service that works and is not abused</td>
              </tr>
              <tr>
                <td>Answering your support messages</td>
                <td>Performance of our contract; your consent</td>
              </tr>
              <tr>
                <td>Service announcements you need to know about — outages, security, changes to these terms</td>
                <td>Our legitimate interest in telling you things that affect your account</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          We do not sell personal data, and we do not share it for anyone else's marketing. Where
          we rely on your consent you may withdraw it at any time — see{" "}
          <a href="#your-rights">your rights</a> — and doing so does not undo processing that was
          lawful before you withdrew it.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "Your content and the AI features",
    body: (
      <>
        <p>
          Drafting, editing, literature validation and diagram generation work by sending the
          relevant part of your document, prompt or reference list to an AI model provider, which
          returns the result. This is the only way those features can work, and it happens only for
          the request you made.
        </p>
        <p>
          <strong>We do not use your research content to train AI models</strong>, and we contract
          with our model providers on terms that prohibit them from training on content submitted
          through our account. If that ever changes it will be an opt-in you are asked for
          explicitly, never a quiet edit to this page.
        </p>
        <p>
          Two things worth knowing before you paste something in. AI output can be wrong —
          including citations that look real and are not — so it needs checking; that is covered in
          the <Link to="/terms#ai-output">Terms</Link>. And if your work is under an NDA, covers
          patient or personal data, or is otherwise restricted by your institution, satisfy
          yourself that sending it to a cloud service is permitted before you do.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who else processes your data",
    body: (
      <>
        <p>
          We run CitePark on infrastructure operated by others. Each of these processes data only
          on our instructions and only for the purpose listed:
        </p>
        <div className="legal-table">
          <table>
            <caption className="sr-only">Sub-processors</caption>
            <thead>
              <tr>
                <th scope="col">Who</th>
                <th scope="col">What they handle</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Supabase</td>
                <td>Authentication, database and file storage — accounts, projects and documents</td>
              </tr>
              <tr>
                <td>Razorpay</td>
                <td>Payment processing. Card and UPI details are collected by them, not by us</td>
              </tr>
              <tr>
                <td>Google</td>
                <td>Sign in with Google, for accounts that choose it</td>
              </tr>
              <tr>
                <td>Our hosting and delivery providers</td>
                <td>Serving the site and application, and the logs that produces</td>
              </tr>
              <tr>
                <td>AI model providers</td>
                <td>
                  Generating the drafts, edits, diagrams and validations you request — see{" "}
                  <a href="#ai">above</a>
                </td>
              </tr>
              <tr>
                <td>Email delivery provider</td>
                <td>Account emails: verification, password resets, receipts, service notices</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>Beyond those, we disclose personal data only when:</p>
        <ul>
          <li>you ask us to, or you share a project with someone yourself;</li>
          <li>
            the law requires it — a valid order from a court or authority with jurisdiction over
            us. Where we are permitted to tell you, we will;
          </li>
          <li>
            it is necessary to establish or defend a legal claim, or to protect the rights and
            safety of our users or the public;
          </li>
          <li>
            the business is merged, acquired or reorganised — in which case the acquirer is bound
            by this policy, and you will be told before anything about it changes.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Where your data is held",
    body: (
      <>
        <p>
          Some of the providers above operate outside India, so your data may be stored or
          processed abroad. Where that happens we rely on contractual protections with the provider
          and transfer only what the service needs, and we do not transfer personal data to any
          country the Central Government has restricted under the DPDP Act.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <>
        <ul>
          <li>
            <strong>Your account and content</strong> — for as long as your account exists. Delete
            your account and we delete them within 30 days, except where a clause below requires
            otherwise.
          </li>
          <li>
            <strong>Backups</strong> — deleted content can persist in encrypted backups for up to
            90 days before it is overwritten in the ordinary rotation.
          </li>
          <li>
            <strong>Payment and tax records</strong> — kept for as long as tax and company law
            requires, which is longer than your account may last. These are transaction records,
            not your research.
          </li>
          <li>
            <strong>Logs and diagnostics</strong> — typically 90 days, longer only where an
            investigation into abuse or a security incident is open.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <>
        <p>
          Traffic to CitePark is encrypted in transit with TLS, and data is encrypted at rest by
          our storage providers. Passwords are stored only as salted hashes — we cannot read yours,
          which is why a reset replaces it rather than reminding you of it. Access to production
          data is limited to the people who need it to operate and support the service. Payment
          verification happens on our server against a signature we check ourselves; a tampered
          browser cannot grant itself Premium.
        </p>
        <p>
          No system is perfectly secure. If a breach affects your personal data we will notify you
          and the Data Protection Board of India as the DPDP Act requires. You can help by using a
          strong, unique password and not sharing your account.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>
          As a Data Principal under the DPDP Act you have the right to:
        </p>
        <ul>
          <li>
            <strong>Know</strong> what personal data of yours we hold, what we do with it, and who
            we have shared it with;
          </li>
          <li>
            <strong>Correct</strong> data that is inaccurate, and complete data that is not;
          </li>
          <li>
            <strong>Erase</strong> your personal data where we no longer need it for the purpose it
            was collected for, or for a legal obligation;
          </li>
          <li>
            <strong>Withdraw consent</strong> at any time, with the same ease as it was given;
          </li>
          <li>
            <strong>Nominate</strong> someone to exercise these rights on your behalf in the event
            of your death or incapacity;
          </li>
          <li>
            <strong>Complain</strong> — to our Grievance Officer first, and to the Data Protection
            Board of India if we do not resolve it.
          </li>
        </ul>
        <p>
          Much of this you can do yourself in your account settings. For anything else, write to{" "}
          {mailto} from the address on the account and we will respond within{" "}
          {GRIEVANCE_RESPONSE_DAYS} days. We may need to confirm it is you before acting, and we
          will say so if a request is one we are legally required to refuse in part.
        </p>
        <p>
          If you are in the European Economic Area or the United Kingdom, you also have the rights
          to data portability, to object to processing based on legitimate interests, and to
          complain to your national supervisory authority.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <>
        <p>
          CitePark is not intended for anyone under 18, and we do not knowingly collect personal
          data from children. If you believe a child has given us personal data, write to {mailto}{" "}
          and we will delete it.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We will update this page when the product changes what it collects or how it is handled.
          The date at the top moves whenever the substance does. If a change materially affects
          your rights we will tell you by email or in the application before it takes effect, rather
          than relying on you to notice.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact and grievances",
    body: (
      <>
        <p>
          For any question about this policy, or to exercise a right under it, write to {mailto}.
        </p>
        <p>
          <strong>Grievance Officer:</strong> <Fill value={GRIEVANCE_OFFICER} />
          <br />
          <strong>Email:</strong> {mailto}
          <br />
          <strong>Address:</strong> <Fill value={LEGAL_ENTITY} />, <Fill value={LEGAL_ADDRESS} />
        </p>
        <p>
          Complaints are acknowledged promptly and resolved within {GRIEVANCE_RESPONSE_DAYS} days.
          If you are not satisfied with the outcome you may complain to the Data Protection Board
          of India.
        </p>
      </>
    ),
  },
];

const Privacy = () => (
  <LegalPage
    eyebrow="Privacy"
    title="What we collect, and what we"
    script="never will."
    intro={
      <>
        Your research is the most valuable thing you will put into CitePark, so this page is
        written to be read rather than to be survived. It says exactly what we hold, who else
        touches it, and how to get it back or have it deleted.
      </>
    }
    updated={LEGAL_UPDATED}
    sections={sections}
    sibling={{ label: "Read the Terms and Conditions", to: "/terms" }}
  />
);

export default Privacy;
