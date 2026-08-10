import { Metadata } from "next";
import { PageModel } from "@/models/page.model";
import { buildPageMetadata } from "@/lib/pageMetadata";
import AboutClientView from "./_components/AboutClientView";

// Incremental Static Revalidation (ISR) for super fast page loads
export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zenvro.com";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about-us", "/about", {
    title: "About Us | VELOUR Independent Fashion House",
    description:
      "Crafted in small runs. Worn for a lifetime. VELOUR is an independent fashion house chasing the perfect collision of comfort and design.",
    keywords: [
      "velour fashion",
      "independent fashion house",
      "sustainable clothing",
      "limited drop apparel",
      "luxury streetwear",
      "eco-friendly fashion",
    ],
    ogImage: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200",
  });
}

export default async function AboutPage() {
  let initialPage = null;

  try {
    await PageModel.seedDefaults();
    initialPage = await PageModel.findBySlug("about-us");
    if (initialPage) {
      initialPage = JSON.parse(JSON.stringify(initialPage));
    }
  } catch (error) {
    console.error("Server fetch about page error:", error);
  }

  // Schema.org Structured Data (JSON-LD) for Local Business & Brand SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        "name": "VELOUR",
        "url": BASE_URL,
        "logo": `${BASE_URL}/icon.png`,
        "description": "Independent fashion house chasing the perfect collision of comfort and design.",
        "sameAs": [
          "https://instagram.com/velour",
          "https://twitter.com/velour",
          "https://facebook.com/velour"
        ]
      },
      {
        "@type": "ClothingStore",
        "@id": `${BASE_URL}/#localbusiness`,
        "name": "VELOUR Atelier",
        "image": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
        "telephone": "+1-800-555-0199",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "100 Atelier Way",
          "addressLocality": "New York",
          "addressRegion": "NY",
          "postalCode": "10001",
          "addressCountry": "US"
        },
        "priceRange": "$$$"
      },
      {
        "@type": "AboutPage",
        "@id": `${BASE_URL}/about#webpage`,
        "url": `${BASE_URL}/about`,
        "name": "About VELOUR | Independent Fashion House",
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${BASE_URL}/#website`,
          "url": BASE_URL,
          "name": "VELOUR"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClientView initialPage={initialPage} />
    </>
  );
}
