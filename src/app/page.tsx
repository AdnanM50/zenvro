import type { Metadata } from "next";
import type { Testimonial } from "@/types";
import { PageModel } from "@/models/page.model";
import { TestimonialModel } from "@/models/testimonial.model";
import { buildPageMetadata } from "@/lib/pageMetadata";
import HomeClientView from "@/app/_components/home/HomeClientView";
import Product from "@/components/Product";
import Collections from "@/components/Collections";

// Incremental Static Revalidation (ISR) for super fast page loads
export const revalidate = 60;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zenvro.com";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("home", "/", {
    title: "VELOUR | Independent Fashion House",
    description:
      "Explore curated collections, exclusive drops, and everyday essentials all thoughtfully designed in one stylish shopping destination.",
    keywords: [
      "velour fashion",
      "independent fashion house",
      "sustainable clothing",
      "limited drop apparel",
      "luxury streetwear",
      "urban fashion",
    ],
    ogImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf",
  });
}

export default async function Home() {
  let initialPage = null;
  let initialTestimonials: Testimonial[] | null = null;

  try {
    await PageModel.seedDefaults();
    initialPage = await PageModel.findBySlug("home");
    if (initialPage) {
      initialPage = JSON.parse(JSON.stringify(initialPage));
    }

    initialTestimonials = await TestimonialModel.findAllActive();
    if (initialTestimonials) {
      initialTestimonials = JSON.parse(JSON.stringify(initialTestimonials));
    }
  } catch (error) {
    console.error("Server fetch home page error:", error);
  }

  // Schema.org Structured Data (JSON-LD) for Brand & WebSite SEO
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
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        "url": BASE_URL,
        "name": "VELOUR",
        "publisher": { "@id": `${BASE_URL}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${BASE_URL}/#webpage`,
        "url": BASE_URL,
        "name": "VELOUR | Independent Fashion House",
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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClientView initialPage={initialPage} initialTestimonials={initialTestimonials} />
      <Product />
      <Collections />
    </main>
  );
}
