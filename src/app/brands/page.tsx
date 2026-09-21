import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BrandModel } from '@/models/brand.model';
import { generateStaticPageMetadata, BreadcrumbJsonLd, CollectionJsonLd } from '@/seo';

export const metadata: Metadata = generateStaticPageMetadata({
  title: 'Official Brands & Designer Labels',
  description:
    'Discover signature designer labels, collaborative houses, and curated brands exclusively available at VELOUR.',
  path: '/brands',
  keywords: ['brands', 'fashion labels', 'designer brands', 'velour designers'],
});

const fallbackBrands = [
  {
    name: 'VELOUR Studio',
    slug: 'velour',
    description: 'The in-house experimental division crafting limited capsules and technical outerwear.',
    logo: '/logo.png',
  },
  {
    name: 'ZENVRO Atelier',
    slug: 'zenvro',
    description: 'Minimalist tailoring, organic textiles, and sustainable garments designed for daily life.',
    logo: '/logo.png',
  },
];

export default async function BrandsIndexPage() {
  let brands = fallbackBrands;

  try {
    const dbBrands = await BrandModel.findAll();
    if (dbBrands && dbBrands.length > 0) {
      brands = dbBrands
        .filter((b) => b.isActive !== false)
        .map((b) => ({
          name: b.name,
          slug: b.slug,
          description: b.description || `Explore the curated ${b.name} selection.`,
          logo: b.logo || '/logo.png',
        }));
    }
  } catch {}

  const structuredItems = brands.map((b) => ({
    name: b.name,
    url: `/brands/${b.slug}`,
    image: b.logo,
  }));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Brands', url: '/brands' },
        ]}
      />
      <CollectionJsonLd
        name="Official Brands Directory"
        description="Featured fashion houses and labels"
        url="/brands"
        items={structuredItems}
      />

      <main className="bg-surface text-on-surface min-h-screen">
        <section className="relative pt-28 md:pt-36 pb-16 px-5 md:px-10 lg:px-16 border-b border-outline-variant bg-background">
          <div className="mx-auto max-w-[1400px]">
            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              {'// BRANDS DIRECTORY'}
            </p>
            <h1 className="mt-4 font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
              Designers & Labels
            </h1>
            <p className="mt-6 max-w-[640px] text-sm md:text-base leading-7 text-secondary">
              Our roster of world-class creators, craftspeople, and contemporary ateliers.
            </p>
          </div>
        </section>

        <section className="px-5 md:px-10 lg:px-16 py-16">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  className="group block border border-outline-variant bg-background p-8 transition duration-500 hover:border-black dark:hover:border-white"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-14 w-14 rounded-xl object-contain border border-outline-variant p-2 bg-surface-container"
                    />
                    <div>
                      <h2 className="font-headline text-2xl font-black tracking-tight text-on-surface group-hover:text-primary transition">
                        {brand.name}
                      </h2>
                      <span className="text-xs text-secondary">Official Label</span>
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-secondary leading-relaxed">
                    {brand.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <span>View Collection</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
