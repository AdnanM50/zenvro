import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/pageMetadata";
import ContactClientView from "./_components/ContactClientView";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact-us", "/contact", {
    title: "Contact Us | Zenvro Store",
    description:
      "Questions, sizing advice, or a collaboration in mind? Drop us a line — a real human from the Zenvro team replies within one working day.",
    keywords: [
      "contact us",
      "contact zenvro",
      "customer service",
      "support",
      "email",
      "phone",
      "say hello",
    ],
    ogImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1200",
  });
}

export default function ContactPage() {
  return <ContactClientView />;
}
