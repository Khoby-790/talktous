import { Link } from "react-router";
import { Voice } from "~/components/fluid";
import { LEGAL } from "./company";
import { B, LegalPage, type LegalSection, Mail, P, UL } from "./layout";

export function meta() {
  return [
    { title: "Terms of Service — Asotie" },
    { name: "description", content: "The terms that govern your use of Asotie." },
  ];
}

const privacyLink = (
  <Link to="/privacy" className="text-[#ffa25e] underline-offset-4 hover:text-ember hover:underline">
    Privacy Policy
  </Link>
);

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "The agreement",
    body: (
      <>
        <P>
          These Terms of Service ("Terms") are an agreement between you and {LEGAL.legalName} ("{LEGAL.product}", "we", "us") and govern
          your use of the {LEGAL.product} website, dashboard, chat widget and related services (the "Service").
        </P>
        <P>
          If you use the Service on behalf of an organization, you confirm you are authorized to accept these Terms for it, and "you" means
          that organization. By creating an account or using the Service, you agree to these Terms and to our {privacyLink}.
        </P>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and workspaces",
    body: (
      <UL>
        <li>You must be at least 18 and give accurate account information.</li>
        <li>
          You are responsible for your workspace, for everyone you invite to it, and for keeping credentials secure. Tell us promptly at{" "}
          <Mail to={LEGAL.supportEmail} /> if you suspect unauthorized access.
        </li>
        <li>Admins control access, roles and settings for their workspace, including which agents can see which conversations.</li>
      </UL>
    ),
  },
  {
    id: "billing",
    title: "Trials, plans and billing",
    body: (
      <>
        <UL>
          <li>
            <B>Free trial.</B> New workspaces may start with a free trial. Unless you cancel before it ends, your chosen plan begins and the
            payment method you provided is charged.
          </li>
          <li>
            <B>Subscriptions</B> renew automatically for the same period until cancelled. You can cancel at any time in Settings → Billing;
            cancellation takes effect at the end of the current billing period.
          </li>
          <li>
            <B>Payments</B> are processed by our payment provider (Paystack). Fees are shown before you pay and exclude taxes unless stated.
          </li>
          <li>
            <B>Price changes</B> take effect at your next renewal, with at least 30 days' notice.
          </li>
          <li>
            <B>Refunds.</B> Fees are non-refundable except where required by law or where we state otherwise in writing.
          </li>
          <li>If a payment fails, we may limit or suspend the workspace until the balance is settled.</li>
        </UL>
      </>
    ),
  },
  {
    id: "customer-data",
    title: "Your data",
    body: (
      <>
        <P>
          You keep all rights to the content you and your customers put into the Service ("Customer Data"). You grant us a limited licence
          to host, process, transmit and display Customer Data only to provide, secure and support the Service for you, as described in our{" "}
          {privacyLink}.
        </P>
        <P>
          You are responsible for having the right to collect and share Customer Data, including giving your own customers any notices and
          obtaining any consents the law requires. You can export or delete Customer Data while your account is active.
        </P>
      </>
    ),
  },
  {
    id: "ai",
    title: "AI features",
    body: (
      <>
        <P>
          AI Assist is optional. To use it, you connect your own account with a third-party AI provider; your use of that provider is also
          governed by its terms, and the provider bills you directly for usage.
        </P>
        <P>
          AI output can be inaccurate, incomplete or inappropriate. Drafts are suggestions: a person on your team reviews and sends every
          reply, and you are responsible for what is sent. We do not use your Customer Data to train AI models.
        </P>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <P>You agree not to, and not to let anyone else:</P>
        <UL>
          <li>use the Service to break any law, or to send spam, unsolicited bulk messages or deceptive content;</li>
          <li>upload malware, or content that infringes others' rights or is abusive, hateful or exploits minors;</li>
          <li>collect sensitive data such as full payment card numbers or health records through conversations unless the law allows it and you have the safeguards it requires;</li>
          <li>probe, disrupt or overload the Service, or get around its security or usage limits;</li>
          <li>copy, resell or reverse engineer the Service, or use it to build a competing product;</li>
          <li>break the policies of connected channels, such as WhatsApp's business messaging rules.</li>
        </UL>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <P>
        The Service works with third-party products such as messaging channels, AI providers and integrations. Your use of them is governed
        by their own terms, and we are not responsible for them. If a third party changes or withdraws its service, related features may
        stop working.
      </P>
    ),
  },
  {
    id: "ip",
    title: "Our intellectual property",
    body: (
      <P>
        The Service, including its software, design and brand, belongs to {LEGAL.product} and its licensors. These Terms give you a limited,
        non-exclusive, non-transferable right to use it during your subscription. If you send us feedback, we may use it without obligation
        to you.
      </P>
    ),
  },
  {
    id: "availability",
    title: "Availability and changes",
    body: (
      <P>
        We work to keep the Service available and secure, but it may sometimes be interrupted for maintenance, upgrades or reasons outside
        our control. We may change or improve features; if we remove a material feature you pay for, we will tell you in advance.
      </P>
    ),
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    body: (
      <P>
        Each party will protect the other's non-public information with at least reasonable care, and use it only to perform under these
        Terms. This does not apply to information that is public, already known, independently developed or lawfully received from someone
        else.
      </P>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <>
        <P>
          You may stop using the Service and close your workspace at any time. We may suspend or end your access if you materially breach
          these Terms, fail to pay, or if your use creates a legal or security risk; where reasonable, we will tell you first and give you a
          chance to fix the problem.
        </P>
        <P>
          After termination you will have 30 days to request an export of your Customer Data, after which we will delete it as described in
          our {privacyLink}. Sections that by their nature should survive termination will survive.
        </P>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    body: (
      <P>
        Except as expressly stated in these Terms, the Service is provided "as is" and "as available". To the fullest extent the law allows,
        we disclaim all implied warranties, including merchantability, fitness for a particular purpose and non-infringement, and we do not
        warrant that the Service will be uninterrupted or error-free.
      </P>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <P>
        To the fullest extent the law allows, neither party is liable for indirect, incidental, special, consequential or punitive damages,
        or for lost profits, revenue or data. Each party's total liability arising from these Terms is limited to the amounts you paid us in
        the 12 months before the event giving rise to the claim. These limits do not apply to your payment obligations, your indemnity
        obligations, or liability that cannot be limited by law.
      </P>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnification",
    body: (
      <P>
        You will defend and indemnify {LEGAL.product} against third-party claims arising from your Customer Data, your use of the Service in
        breach of these Terms or the law, or messages your team sends through the Service.
      </P>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <P>
        These Terms are governed by the laws of {LEGAL.jurisdiction}, without regard to conflict-of-law rules. The courts of that
        jurisdiction have exclusive jurisdiction over any dispute, except that either party may seek urgent injunctive relief anywhere.
      </P>
    ),
  },
  {
    id: "general",
    title: "Changes and general terms",
    body: (
      <>
        <P>
          We may update these Terms. For material changes we will give account owners at least 30 days' notice by email or in the dashboard;
          continuing to use the Service after that means you accept them.
        </P>
        <P>
          These Terms, together with any order form or data processing agreement, are the entire agreement between us about the Service. If
          any part is unenforceable, the rest stays in effect. Failing to enforce a right is not a waiver of it. You may not assign these
          Terms without our consent; we may assign them as part of a merger or sale of our business. Neither party is liable for delays
          caused by events beyond its reasonable control.
        </P>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <P>
        {LEGAL.legalName}, {LEGAL.address}. Email <Mail to={LEGAL.legalEmail} />.
      </P>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of service"
      title={
        <>
          The fine print, <Voice>in plain words.</Voice>
        </>
      }
      intro={`These terms set out what you can expect from ${LEGAL.product}, and what we expect in return, when your team uses it to look after your customers.`}
      sections={sections}
    />
  );
}
