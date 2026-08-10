import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import type { LegalSection } from "@/components/legal/LegalLayout";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("privacy-policy", "/privacy", {
    title: "Privacy Policy | Zenvro Store",
    description:
      "Your data deserves the same care as our craft. Learn how Zenvro collects, uses, and safeguards your personal information.",
    keywords: [
      "privacy policy",
      "data protection",
      "security",
      "cookies",
      "personal information",
      "gdpr",
    ],
    ogImage: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?auto=format&fit=crop&q=80&w=1200",
  });
}

const SECTIONS: LegalSection[] = [
  {
    id: "what-we-collect",
    num: "01",
    title: "Information we collect",
    body: [
      "We collect information you provide directly — such as your name, email address, shipping and billing address, phone number, and order history when you create an account, place an order, or contact our team.",
      "We also collect limited information automatically when you browse the Service, including device type, browser, IP address, pages visited, and referring links. This helps us understand how our community shops and keeps the Service running smoothly.",
    ],
  },
  {
    id: "how-we-use",
    num: "02",
    title: "How we use your information",
    body: [
      "We use your information to process and deliver orders, manage your account, provide customer support, and send you service-related communications such as order updates and delivery tracking.",
      "With your consent, we may send editorial updates and early access to new drops. You can opt out of marketing at any time using the unsubscribe link in any email or by contacting us directly.",
    ],
    list: [
      "Fulfilling and shipping your orders",
      "Processing payments and preventing fraud",
      "Personalizing your experience on the Service",
      "Improving our products and the Service",
      "Responding to questions and support requests",
      "Sending updates and drop announcements you opted into",
    ],
  },
  {
    id: "cookies",
    num: "03",
    title: "Cookies & tracking",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Service is used. Some cookies are strictly necessary for the Service to function.",
      "You can control cookies through your browser settings. Disabling certain cookies may affect how the Service works — for example, your cart and session may not be remembered between visits.",
    ],
  },
  {
    id: "sharing",
    num: "04",
    title: "Sharing & disclosure",
    body: [
      "We never sell your personal information. We only share data with trusted service providers who help us operate the Service — for example, payment processors, shipping carriers, and hosting providers — and only to the extent needed to serve you.",
      "We may disclose information where required by law, to protect the rights and safety of VELOUR, our community, or others, or in connection with a merger, sale, or transfer of assets.",
    ],
  },
  {
    id: "retention",
    num: "05",
    title: "Data retention",
    body: [
      "We keep personal information for as long as your account is active, as long as needed to provide the Service, or as required to meet legal, tax, and accounting obligations.",
      "When information is no longer needed, we delete or anonymize it in a secure manner. Order records are retained in accordance with applicable financial record-keeping requirements.",
    ],
  },
  {
    id: "your-rights",
    num: "06",
    title: "Your rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, or delete the personal information we hold about you, to object to or restrict certain processing, and to receive a portable copy of your data.",
      "To exercise any of these rights, contact us at hello@orbix.studio. We will respond within the timeframe required by applicable law. We may ask you to verify your identity before acting on your request.",
    ],
  },
  {
    id: "security",
    num: "07",
    title: "Security",
    body: [
      "We take reasonable administrative, technical, and physical measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
      "Payment transactions are encrypted and processed by PCI-compliant providers. No method of transmission over the internet is 100% secure, so while we work hard to protect your data, we cannot guarantee absolute security.",
    ],
  },
  {
    id: "children",
    num: "08",
    title: "Children's privacy",
    body: [
      "The Service is not directed to children under the age of 16, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it promptly.",
    ],
  },
  {
    id: "changes",
    num: "09",
    title: "Changes to this policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal obligations. We will post the updated policy on this page with a revised \"Last updated\" date.",
      "If we make material changes, we will take reasonable steps to notify you, such as an on-site notice or an email to the address associated with your account. Continued use of the Service after changes are posted constitutes acceptance of the revised policy.",
    ],
  },
  {
    id: "contact",
    num: "10",
    title: "Contact",
    body: [
      "Have questions or privacy requests? Our team is happy to help — replies typically arrive within one working day.",
    ],
    list: [
      "Email: hello@orbix.studio",
      "Phone: +016 76234396",
      "Location: 5567 Washington Ave, America, 32289",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="// Privacy Policy"
      docCode="LEGAL_DOC_PRIVACY_V01"
      title={"Privacy\nPolicy"}
      intro="Your data deserves the same care as our craft. This policy explains what we collect, why we collect it, and the control you keep over your personal information."
      lastUpdated="August 8, 2026"
      sections={SECTIONS}
    />
  );
}
