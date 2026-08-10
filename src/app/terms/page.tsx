import type { Metadata } from "next";
import { PageModel } from "@/models/page.model";
import { buildPageMetadata } from "@/lib/pageMetadata";
import LegalClientView from "@/components/legal/LegalClientView";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("terms-conditions", "/terms", {
    title: "Terms & Conditions | Zenvro Store",
    description:
      "The fine print behind the fabric. Review the rules and guidelines governing your use of the Zenvro website and services.",
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

export default async function TermsPage() {
  let initialPage = null;

  try {
    await PageModel.seedDefaults();
    initialPage = await PageModel.findBySlug("terms-conditions");
    if (initialPage) {
      initialPage = JSON.parse(JSON.stringify(initialPage));
    }
  } catch (error) {
    console.error("Server fetch terms page error:", error);
  }

  return <LegalClientView slug="terms-conditions" initialPage={initialPage} />;
}
