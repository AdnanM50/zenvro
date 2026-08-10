import type { Metadata } from "next";
import LegalLayout from "@/components/legal/LegalLayout";
import type { LegalSection } from "@/components/legal/LegalLayout";
import { buildPageMetadata } from "@/lib/pageMetadata";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("terms-conditions", "/terms", {
    title: "Terms & Conditions | Zenvro Store",
    description:
      "The fine print behind the fabric. Review the rules and guidelines governing your use of the VELOUR website and services.",
    keywords: [
      "terms of service",
      "terms and conditions",
      "user agreement",
      "legal",
      "refunds",
      "shipping policy",
    ],
    ogImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200",
  });
}

const SECTIONS: LegalSection[] = [
  {
    id: "agreement",
    num: "01",
    title: "Agreement to terms",
    body: [
      "Welcome to VELOUR, an independent fashion house. These Terms and Conditions (the \"Terms\") govern your access to and use of the VELOUR website, any of our stores, and every product, drop, and service we offer (together, the \"Service\").",
      "By accessing or using the Service you agree to be bound by these Terms. If you do not agree, please do not use the Service. We may revise these Terms at any time; the latest version is always published on this page and the date of revision is noted at the top.",
    ],
  },
  {
    id: "the-service",
    num: "02",
    title: "The service",
    body: [
      "VELOUR designs and produces limited-run clothing and accessories. Every collection is released as a small, numbered batch and each piece is hand-finished in our atelier.",
      "We reserve the right to modify, suspend, or discontinue any part of the Service — including specific drops, silhouettes, or colorways — at any time without notice. When a limited drop sells out, it stays out.",
    ],
  },
  {
    id: "intellectual-property",
    num: "03",
    title: "Intellectual property",
    body: [
      "All content on the Service — including designs, patterns, photography, editorial, brand marks, logos, text, and code — is owned by or licensed to VELOUR and is protected by applicable copyright, trademark, and other intellectual property laws.",
      "You may view and share content for personal, non-commercial purposes as long as you credit VELOUR and do not modify it. You may not reproduce, resell, or repurpose our designs, imagery, or content without written permission.",
    ],
  },
  {
    id: "purchases",
    num: "04",
    title: "Purchases & pricing",
    body: [
      "When you place an order, you are making an offer to purchase the selected pieces at the price shown at checkout, plus any applicable shipping, duties, and taxes. We may accept or decline any order at our discretion.",
      "Prices are displayed in your local currency where possible and are exclusive of taxes unless otherwise stated. We make every effort to ensure pricing is accurate, but we reserve the right to correct errors and to update prices at any time. Orders already confirmed will not be repriced without your consent.",
    ],
  },
  {
    id: "drops",
    num: "05",
    title: "Limited drops & availability",
    body: [
      "Collections are produced as small, numbered runs and are never mass-produced or quietly restocked. Drop windows are announced on the Service and stock is limited.",
      "Because runs are short, we cannot guarantee availability. High demand may cause pieces to sell out during checkout. Sold-out silhouettes may return in a future season in a new form, but never as a direct restock.",
    ],
  },
  {
    id: "shipping",
    num: "06",
    title: "Shipping & delivery",
    body: [
      "We ship worldwide to 12+ countries. Every order includes express tracking, and in most regions pieces arrive within 3–7 working days.",
      "Delivery times are estimates, not guarantees. Risk of loss passes to you on delivery, and you are responsible for providing an accurate delivery address. Duties and taxes are calculated at checkout so there are no surprises at the door.",
    ],
  },
  {
    id: "returns",
    num: "07",
    title: "Returns & exchanges",
    body: [
      "You have 30 days from delivery to return any unworn piece in its original condition with tags attached. Exchanges for a different size are free, and the return label is always on us.",
      "To begin a return or exchange, contact our team at hello@orbix.studio. Refunds are issued to the original payment method within 14 days of receiving the returned piece. Final-sale and promotional items may not be eligible.",
    ],
  },
  {
    id: "accounts",
    num: "08",
    title: "User responsibilities",
    body: [
      "If you create an account, you are responsible for keeping your credentials secure and for all activity that occurs under your account. Notify us immediately of any unauthorized use.",
      "You agree to use the Service only for lawful purposes and to provide accurate, current information when ordering. Attempting to interfere with the Service, misrepresent your identity, or resell pieces for commercial gain without permission is not allowed.",
    ],
  },
  {
    id: "liability",
    num: "09",
    title: "Limitation of liability",
    body: [
      "The Service is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.",
      "To the fullest extent permitted by law, VELOUR shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including lost profits or loss of data. Nothing in these Terms limits liability that cannot be limited under applicable law.",
    ],
  },
  {
    id: "governing-law",
    num: "10",
    title: "Governing law",
    body: [
      "These Terms are governed by and construed in accordance with the laws applicable in the jurisdiction where VELOUR is established, without regard to conflict-of-law principles.",
      "Any dispute arising from these Terms or your use of the Service will be resolved through good-faith negotiation first. If negotiation fails, disputes will be submitted to the exclusive jurisdiction of the competent courts.",
    ],
  },
  {
    id: "contact",
    num: "11",
    title: "Contact",
    body: [
      "Questions about these Terms or the Service? Reach out any time — our team replies within one working day.",
    ],
    list: [
      "Email: hello@orbix.studio",
      "Phone: +016 76234396",
      "Location: 5567 Washington Ave, America, 32289",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="// Terms & Conditions"
      docCode="LEGAL_DOC_TERMS_V01"
      title={"Terms &\nConditions"}
      intro="The fine print behind the fabric. These Terms govern your use of the VELOUR Service — from browsing the archive to every numbered drop that lands at your door."
      lastUpdated="August 8, 2026"
      sections={SECTIONS}
    />
  );
}
