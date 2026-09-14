import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CollectionModel } from "@/models/collection.model";
import { ProductModel } from "@/models/product.model";
import { CategoryModel } from "@/models/category.model";
import { TagModel } from "@/models/tag.model";
import {
  formatProductForUI,
  products as fallbackProducts,
  type Product as UIProduct,
} from "@/lib/products";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const collections = await CollectionModel.findAll();
    return collections.map((c) => ({ slug: c.slug }));
  } catch {
    return [
      { slug: "winter-monolith-26" },
      { slug: "quiet-utility-capsule" },
      { slug: "velour-noir-drop" },
    ];
  }
}

async function fetchCollectionData(slug: string) {
  try {
    let collectionItem = await CollectionModel.findBySlug(slug);
    if (!collectionItem) {
      collectionItem = await CollectionModel.findById(slug);
    }

    if (collectionItem && collectionItem.isActive !== false) {
      // Build maps
      let categoryMap: Record<string, string> = {};
      try {
        const cats = await CategoryModel.findAll();
        cats.forEach((c) => {
          if (c._id) categoryMap[c._id] = c.name;
          if (c.slug) categoryMap[c.slug] = c.name;
        });
      } catch {}

      let tagMap: Record<string, string> = {};
      try {
        const tags = await TagModel.findAll();
        tags.forEach((t) => {
          if (t._id) tagMap[t._id] = t.name;
          if (t.slug) tagMap[t.slug] = t.name;
        });
      } catch {}

      // Find products
      const pResult = await ProductModel.findPaginated(1, 50, {
        collection: collectionItem._id,
        status: "published",
      });
      let rawProducts = pResult?.products || [];

      if (rawProducts.length === 0) {
        const pResultSlug = await ProductModel.findPaginated(1, 50, {
          collection: collectionItem.slug,
          status: "published",
        });
        rawProducts = pResultSlug?.products || [];
      }

      const formattedProducts = rawProducts.map((p) =>
        formatProductForUI(JSON.parse(JSON.stringify(p)), categoryMap, tagMap)
      );

      return {
        collection: collectionItem,
        products: formattedProducts.length > 0 ? formattedProducts : fallbackProducts,
      };
    }
  } catch (error) {
    console.error("Fetch collection error:", error);
  }

  // Fallback
  return {
    collection: {
      _id: "col-fallback",
      name: slug.replace(/-/g, " ").toUpperCase(),
      slug,
      banner: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
      description: "Curated selection of architectural garments and refined seasonal silhouettes.",
      isActive: true,
    },
    products: fallbackProducts,
  };
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { collection } = await fetchCollectionData(slug);

  if (!collection) {
    return {
      title: "Collection Not Found | VELOUR",
    };
  }

  return {
    title: `${collection.name} | VELOUR Collection`,
    description: collection.description || `Explore the ${collection.name} collection by VELOUR.`,
  };
}

export default async function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const { collection, products } = await fetchCollectionData(slug);

  if (!collection) {
    notFound();
  }

  return (
    <main className="bg-surface text-on-surface min-h-screen">
      {/* ─── Hero Banner ─── */}
      <section className="relative pt-28 md:pt-36 pb-16 px-5 md:px-10 lg:px-16 border-b border-outline-variant bg-background">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/collections"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-background text-on-surface transition hover:bg-primary hover:text-background mb-8"
            aria-label="Back to collections"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>

          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            {"// COLLECTION CAPSULE"}
          </p>

          <h1 className="mt-4 font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
            {collection.name}
          </h1>

          {collection.description && (
            <p className="mt-6 max-w-[640px] text-sm md:text-base leading-7 text-secondary">
              {collection.description}
            </p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c00]" />
            <p className="font-label text-xs font-black uppercase tracking-[0.2em] text-secondary">
              {products.length} {products.length === 1 ? "piece" : "pieces"} in this drop
            </p>
          </div>
        </div>
      </section>

      {/* ─── Products Grid ─── */}
      <section className="px-5 md:px-10 lg:px-16 py-16">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <article key={product.slug} className="group">
                <Link
                  href={`/products/${product.slug}`}
                  className="block border border-outline-variant bg-background overflow-hidden transition duration-500 hover:border-black dark:hover:border-white"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5">
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                      {product.category}
                    </p>
                    <h2 className="mt-2 font-headline text-xl font-black tracking-tight text-on-surface group-hover:text-primary transition">
                      {product.name}
                    </h2>
                    <div className="mt-4 flex items-center justify-between border-t border-outline-variant/60 pt-3">
                      <span className="text-base font-black">{product.price}</span>
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <span className="material-symbols-outlined text-[16px] text-primary">star</span>
                        <span>{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
