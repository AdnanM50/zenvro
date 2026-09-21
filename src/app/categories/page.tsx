import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryModel } from '@/models/category.model';
import { generateStaticPageMetadata, BreadcrumbJsonLd, CollectionJsonLd } from '@/seo';

export const metadata: Metadata = generateStaticPageMetadata({
  title: 'Browse Categories · Apparel & Accessories',
  description:
    'Explore curated categories at VELOUR: outerwear, tailoring, tops, bottoms, and seasonal accessories designed for longevity.',
  path: '/categories',
  keywords: ['categories', 'menswear categories', 'womenswear categories', 'velour fashion'],
});

const fallbackCategories = [
  {
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Technical storm shells, tailored wool overcoats, and insulated jackets.',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Tops',
    slug: 'tops',
    description: 'Dense heavyweight tees, structured overshirts, and textured knits.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pants',
    slug: 'pants',
    description: 'Ergonomic wide trousers, pleat chinos, and utility cargo pants.',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Cordura crossbodies, heavy cotton caps, and crafted leather goods.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
  },
];

export default async function CategoriesIndexPage() {
  let categories = fallbackCategories;

  try {
    const dbCats = await CategoryModel.findAll();
    if (dbCats && dbCats.length > 0) {
      categories = dbCats
        .filter((c) => c.isActive !== false)
        .map((c) => ({
          name: c.name,
          slug: c.slug,
          description: c.description || `Browse the latest ${c.name} collection.`,
          image: c.image || fallbackCategories[0].image,
        }));
    }
  } catch {}

  const structuredItems = categories.map((c) => ({
    name: c.name,
    url: `/categories/${c.slug}`,
    image: c.image,
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
        ]}
      />
      <CollectionJsonLd
        name="Categories Catalog"
        description="All apparel categories at VELOUR"
        url="/categories"
        items={structuredItems}
      />

      <main className="bg-surface text-on-surface min-h-screen">
        <section className="relative pt-28 md:pt-36 pb-16 px-5 md:px-10 lg:px-16 border-b border-outline-variant bg-background">
          <div className="mx-auto max-w-[1400px]">
            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              {'// DIRECTORY'}
            </p>
            <h1 className="mt-4 font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
              Categories
            </h1>
            <p className="mt-6 max-w-[640px] text-sm md:text-base leading-7 text-secondary">
              Browse garments classified by form, silhouette, and function. Built for understated luxury and daily wear.
            </p>
          </div>
        </section>

        <section className="px-5 md:px-10 lg:px-16 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="group block border border-outline-variant bg-background overflow-hidden transition duration-500 hover:border-black dark:hover:border-white"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-surface-container">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="font-headline text-2xl font-black tracking-tight text-on-surface group-hover:text-primary transition">
                      {cat.name}
                    </h2>
                    <p className="mt-2 text-xs text-secondary line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                      <span>Explore Category</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
