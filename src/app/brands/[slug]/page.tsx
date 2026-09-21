import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BrandModel } from '@/models/brand.model';
import { ProductModel } from '@/models/product.model';
import { TagModel } from '@/models/tag.model';
import { CategoryModel } from '@/models/category.model';
import { formatProductForUI, products as fallbackProducts } from '@/lib/products';
import {
  generateBrandMetadata,
  BrandJsonLd,
  BreadcrumbJsonLd,
} from '@/seo';

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const brands = await BrandModel.findAll();
    return brands.map((b) => ({ slug: b.slug }));
  } catch {
    return [{ slug: 'velour' }, { slug: 'zenvro' }];
  }
}

async function fetchBrandData(slug: string) {
  try {
    let brand = await BrandModel.findBySlug(slug);
    if (!brand) {
      brand = await BrandModel.findById(slug);
    }

    if (brand && brand.isActive !== false) {
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

      const pResult = await ProductModel.findPaginated(1, 50, {
        brand: brand._id,
        status: 'published',
      });

      let rawProducts = pResult?.products || [];
      if (rawProducts.length === 0) {
        const pResultName = await ProductModel.findPaginated(1, 50, {
          brand: brand.name,
          status: 'published',
        });
        rawProducts = pResultName?.products || [];
      }

      const formatted = rawProducts.map((p) =>
        formatProductForUI(JSON.parse(JSON.stringify(p)), categoryMap, tagMap)
      );

      return {
        brand,
        products: formatted.length > 0 ? formatted : fallbackProducts.slice(0, 4),
      };
    }
  } catch (error) {
    console.error('Fetch brand error:', error);
  }

  return {
    brand: {
      _id: 'brand-fallback',
      name: slug.replace(/-/g, ' ').toUpperCase(),
      slug,
      logo: '/logo.png',
      description: `Official collection and signature items from ${slug.replace(/-/g, ' ')}.`,
      isActive: true,
    },
    products: fallbackProducts.slice(0, 4),
  };
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { brand } = await fetchBrandData(slug);

  if (!brand) {
    return {
      title: 'Brand Not Found | VELOUR',
      robots: { index: false, follow: false },
    };
  }

  return generateBrandMetadata(brand);
}

export default async function BrandDetailPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const { brand, products } = await fetchBrandData(slug);

  if (!brand) {
    notFound();
  }

  return (
    <>
      {/* Schema.org Brand & Breadcrumb structured data */}
      <BrandJsonLd
        name={brand.name}
        description={brand.description}
        logo={brand.logo}
        url={`/brands/${brand.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: brand.name, url: `/brands/${brand.slug}` },
        ]}
      />

      <main className="bg-surface text-on-surface min-h-screen">
        {/* Header Hero */}
        <section className="relative pt-28 md:pt-36 pb-16 px-5 md:px-10 lg:px-16 border-b border-outline-variant bg-background">
          <div className="mx-auto max-w-[1400px]">
            <Link
              href="/products"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-background text-on-surface transition hover:bg-primary hover:text-background mb-8"
              aria-label="Back to products"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>

            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              {'// BRAND SPOTLIGHT'}
            </p>

            <div className="mt-4 flex flex-col md:flex-row md:items-center gap-6">
              {brand.logo && (
                <img
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  className="h-16 w-16 rounded-xl object-contain border border-outline-variant p-2 bg-surface-container"
                />
              )}
              <h1 className="font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
                {brand.name}
              </h1>
            </div>

            {brand.description && (
              <p className="mt-6 max-w-[640px] text-sm md:text-base leading-7 text-secondary">
                {brand.description}
              </p>
            )}

            <div className="mt-8 flex items-center gap-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c00]" />
              <p className="font-label text-xs font-black uppercase tracking-[0.2em] text-secondary">
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} curated
              </p>
            </div>
          </div>
        </section>

        {/* Product Grid */}
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
                        {brand.name}
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
    </>
  );
}
