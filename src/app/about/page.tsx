import { Metadata } from "next";
import { PageModel } from "@/models/page.model";
import AboutClientView from "./_components/AboutClientView";

// Incremental Static Revalidation (ISR) for super fast page loads
export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zenvro.com";

export async function generateMetadata(): Promise<Metadata> {
  let title = "About Us | VELOUR Independent Fashion House";
  let description =
    "Crafted in small runs. Worn for a lifetime. VELOUR is an independent fashion house chasing the perfect collision of comfort and design.";
  let keywords = [
    "velour fashion",
    "independent fashion house",
    "sustainable clothing",
    "limited drop apparel",
    "luxury streetwear",
    "eco-friendly fashion",
  ];
  let ogImage = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200";

  try {
    await PageModel.seedDefaults();
    const page = await PageModel.findBySlug("about-us");
    if (page?.seo) {
      if (page.seo.metaTitle) title = page.seo.metaTitle;
      if (page.seo.metaDescription) description = page.seo.metaDescription;
      if (page.seo.focusKeyword) keywords.unshift(page.seo.focusKeyword);
      if (page.seo.metaKeywords) {
        keywords.push(...page.seo.metaKeywords.split(',').map((k) => k.trim()).filter(Boolean));
      }
      if (page.seo.additionalKeywords?.length) {
        keywords.push(...page.seo.additionalKeywords);
      }
      if (page.seo.searchPhrases?.length) {
        keywords.push(...page.seo.searchPhrases);
      }
      keywords = [...new Set(keywords.map((k) => k.toLowerCase()))];
      if (page.seo.ogImage) ogImage = page.seo.ogImage;
    }
  } catch (error) {
    console.error("Error generating metadata for about page:", error);
  }

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords,
    authors: [{ name: "VELOUR Atelier", url: BASE_URL }],
    publisher: "VELOUR International",
    alternates: {
      canonical: `${BASE_URL}/about`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/about`,
      siteName: "VELOUR",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "VELOUR Fashion House Atelier",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@velour_official",
    },
  };
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
