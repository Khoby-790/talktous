import { Voice } from "~/components/fluid";
import { LEGAL } from "./company";
import { B, LegalPage, type LegalSection, Mail, P, UL } from "./layout";

export function meta() {
  return [
    { title: "Privacy Policy — Asotie" },
    { name: "description", content: "How Asotie collects, uses and protects personal information." },
  ];
}

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <P>
          {LEGAL.product} is a customer support platform operated by {LEGAL.legalName} ("{LEGAL.product}", "we", "us"), {LEGAL.address}.
          This policy explains what personal information we collect when you visit our website, use the {LEGAL.product} dashboard, or
          talk to a business through an {LEGAL.product} chat widget, email address or WhatsApp number, and what we do with it.
        </P>
      </>
    ),
  },
  {
    id: "our-role",
    title: "Our role",
    body: (
      <>
        <P>
          <B>For account and website data</B> (for example, the people who sign up for and administer an {LEGAL.product} workspace), we
          are the data controller.
        </P>
        <P>
          <B>For Customer Data</B>, meaning the conversations, messages, attachments and contact details that a business's customers send
          through {LEGAL.product}, the business that runs the workspace (our "Customer") is the controller and we act as its processor. We
          handle that data only on the Customer's instructions and under our agreement with them. If you contacted a business through{" "}
          {LEGAL.product}, please send privacy requests to that business first; we will help them respond.
        </P>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    body: (
      <>
        <UL>
          <li>
            <B>Account information:</B> name, work email, password (stored only as a hash), role, organization name, website, industry
            and preferences such as timezone and language.
          </li>
          <li>
            <B>Workspace content:</B> apps and channels you configure, knowledge base articles, saved replies, tags, notes and settings.
          </li>
          <li>
            <B>Customer Data:</B> messages, attachments, names, email addresses, phone numbers and any metadata a Customer chooses to attach
            to a conversation, plus satisfaction ratings.
          </li>
          <li>
            <B>Billing information:</B> plan, billing contact and transaction history. Card details are collected and stored by our payment
            processor; we never see or store full card numbers.
          </li>
          <li>
            <B>Usage and device data:</B> IP address, browser and device type, pages and features used, error reports and log data,
            collected to keep the service working and secure.
          </li>
          <li>
            <B>Communications:</B> messages you send to our own support team and your replies to our emails.
          </li>
        </UL>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use information",
    body: (
      <>
        <UL>
          <li>To provide, maintain and secure the service, including routing conversations, notifications and real-time updates.</li>
          <li>To create and manage accounts, process payments and send service emails such as invitations, receipts and password resets.</li>
          <li>To provide support, respond to requests and communicate about changes to the service.</li>
          <li>To understand usage in aggregate and improve the product.</li>
          <li>To detect, investigate and prevent fraud, abuse and security incidents.</li>
          <li>To comply with legal obligations and enforce our Terms.</li>
        </UL>
        <P>
          We do not sell personal information, we do not use Customer Data for advertising, and we do not use Customer Data to train AI
          models.
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
          AI Assist is optional and is turned on by each Customer. Customers connect their own AI provider account (for example Anthropic,
          OpenAI or Google). When an agent asks for a draft, rewrite or summary, the relevant conversation content and knowledge base
          excerpts are sent to the provider the Customer chose, under that provider's terms. A person always reviews and sends each reply.
        </P>
        <P>
          Provider API keys are stored encrypted and are never shown again after they are saved. We record whether AI drafts were used or
          edited so Customers can see how useful the feature is.
        </P>
      </>
    ),
  },
  {
    id: "legal-bases",
    title: "Legal bases",
    body: (
      <P>
        Where data protection laws such as the GDPR apply, we rely on: <B>contract</B> (to provide the service you signed up for);{" "}
        <B>legitimate interests</B> (to secure, support and improve the service, balanced against your rights); <B>consent</B> (where we
        ask for it, which you can withdraw at any time); and <B>legal obligation</B> (for example, tax and accounting records).
      </P>
    ),
  },
  {
    id: "sharing",
    title: "How we share information",
    body: (
      <>
        <P>We share personal information only as described here:</P>
        <UL>
          <li>
            <B>Service providers</B> that host and operate the platform for us, such as cloud hosting and databases, email delivery,
            payment processing (Paystack), error monitoring, and real-time messaging. They may use the data only to provide their services
            to us.
          </li>
          <li>
            <B>Providers a Customer connects</B>, such as their chosen AI provider, WhatsApp (Meta) or their own integrations. These receive
            data at the Customer's direction.
          </li>
          <li>
            <B>Within a workspace:</B> agents, supervisors and admins of a Customer's workspace can see the conversations their role allows.
          </li>
          <li>
            <B>Legal and safety:</B> when required by law, or to protect the rights, safety and property of our users, the public or{" "}
            {LEGAL.product}.
          </li>
          <li>
            <B>Business transfers:</B> as part of a merger, acquisition or sale of assets, subject to this policy.
          </li>
        </UL>
        <P>
          A current list of our sub-processors is available on request from <Mail to={LEGAL.privacyEmail} />.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <P>
        We use browser storage only for things the service needs: keeping you signed in, remembering preferences such as theme, and, in the
        chat widget, keeping a visitor's conversation and the launcher position across visits. We do not use third-party advertising
        cookies. You can clear this storage in your browser at any time, though you will be signed out and widget conversations may not
        resume.
      </P>
    ),
  },
  {
    id: "retention",
    title: "Retention",
    body: (
      <P>
        We keep account information for as long as your account is active. Customer Data is kept until the Customer deletes it or closes
        their workspace, after which we delete it from active systems within 30 days and from backups on their normal rotation, unless we
        must keep it longer by law. Billing records are kept for as long as tax and accounting rules require.
      </P>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <P>
        We protect data with encryption in transit (TLS), encrypted storage of secrets such as API keys, hashed passwords, role-based access
        controls and restricted, logged access for our own staff. No system is perfectly secure; if we become aware of a breach affecting
        your personal information, we will notify you and the relevant authorities as the law requires.
      </P>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <P>
        We and our service providers may process information in countries other than the one you live in. When we transfer personal data
        out of regions with transfer rules, such as the EEA or UK, we use appropriate safeguards such as Standard Contractual Clauses.
      </P>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <P>Depending on where you live, you may have the right to:</P>
        <UL>
          <li>access the personal information we hold about you and get a copy of it;</li>
          <li>correct inaccurate information, or ask us to delete it;</li>
          <li>object to or restrict certain processing, and withdraw consent;</li>
          <li>receive your data in a portable format;</li>
          <li>not be discriminated against for exercising these rights;</li>
          <li>complain to your local data protection authority.</li>
        </UL>
        <P>
          To make a request, email <Mail to={LEGAL.privacyEmail} />. We may need to verify your identity first. If your request is about
          Customer Data, we will pass it to the business concerned.
        </P>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <P>
        {LEGAL.product} is a business tool and is not directed at children under 16. We do not knowingly collect their personal
        information. If you believe a child has given us personal information, contact us and we will delete it.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <P>
        We may update this policy from time to time. We will change the "Last updated" date above and, for material changes, notify account
        owners by email or in the dashboard before the changes take effect.
      </P>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <P>
        {LEGAL.legalName}, {LEGAL.address}. Email <Mail to={LEGAL.privacyEmail} />.
      </P>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy policy"
      title={
        <>
          Your conversations, <Voice>kept with care.</Voice>
        </>
      }
      intro={`Support runs on trust. This policy explains, in plain language, what ${LEGAL.product} collects, why, who it is shared with, and the choices you have.`}
      sections={sections}
    />
  );
}
