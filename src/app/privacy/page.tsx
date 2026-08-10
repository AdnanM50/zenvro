import type { Metadata } from "next";
import { PageModel } from "@/models/page.model";
import { buildPageMetadata } from "@/lib/pageMetadata";
import LegalClientView from "@/components/legal/LegalClientView";

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

export default async function PrivacyPage() {
  let initialPage = null;

  try {
    await PageModel.seedDefaults();
    initialPage = await PageModel.findBySlug("privacy-policy");
    if (initialPage) {
      initialPage = JSON.parse(JSON.stringify(initialPage));
    }
  } catch (error) {
    console.error("Server fetch privacy page error:", error);
  }

  return <LegalClientView slug="privacy-policy" initialPage={initialPage} />;
}
