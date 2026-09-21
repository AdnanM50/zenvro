import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CategoryModel } from '@/models/category.model';
import { ProductModel } from '@/models/product.model';
import { TagModel } from '@/models/tag.model';
import { formatProductForUI, products as fallbackProducts } from '@/lib/products';
import {
  generateCategoryMetadata,
  CollectionJsonLd,
  BreadcrumbJsonLd,
} from '@/seo';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const categories = await CategoryModel.findAll();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [
      { slug: 'outerwear' },
      { slug: 'tops' },
      { slug: 'pants' },
      { slug: 'accessories' },
    ];
  }
}

async function fetchCategoryData(slug: string) {
  try {
    let category = await CategoryModel.findBySlug(slug);
    if (!category) {
      category = await CategoryModel.findById(slug);
    }

    if (category && category.isActive !== false) {
      let tagMap: Record<string, string> = {};
      try {
        const tags = await TagModel.findAll();
        tags.forEach((t) => {
          if (t._id) tagMap[t._id] = t.name;
          if (t.slug) tagMap[t.slug] = t.name;
        });
      } catch {}

      const categoryMap = { [category._id]: category.name, [category.slug]: category.name };

      const pResult = await ProductModel.findPaginated(1, 50, {
        category: category._id,
        status: 'published',
      });

      let rawProducts = pResult?.products || [];
      if (rawProducts.length === 0) {
        const pResultName = await ProductModel.findPaginated(1, 50, {
          category: category.name,
          status: 'published',
        });
        rawProducts = pResultName?.products || [];
      }

      const formatted = rawProducts.map((p) =>
        formatProductForUI(JSON.parse(JSON.stringify(p)), categoryMap, tagMap)
      );

      return {
        category,
        products: formatted.length > 0 ? formatted : fallbackProducts.slice(0, 4),
      };
    }
  } catch (error) {
    console.error('Fetch category error:', error);
  }

  return {
    category: {
      _id: 'cat-fallback',
      name: slug.replace(/-/g, ' ').toUpperCase(),
      slug,
      description: `Curated assortment of ${slug.replace(/-/g, ' ')} designed for everyday utility.`,
      isActive: true,
    },
    products: fallbackProducts.slice(0, 4),
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await fetchCategoryData(slug);

  if (!category) {
    return {
      title: 'Category Not Found | VELOUR',
      robots: { index: false, follow: false },
    };
  }

  return generateCategoryMetadata(category);
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const { category, products } = await fetchCategoryData(slug);

  if (!category) {
    notFound();
  }

  const structuredItems = products.map((p) => ({
    name: p.name,
    url: `/products/${p.slug}`,
    image: p.image,
  }));

  return (
    <>
      {/* Schema.org Collection & Breadcrumbs */}
      <CollectionJsonLd
        name={category.name}
        description={category.description}
        url={`/categories/${category.slug}`}
        items={structuredItems}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
          { name: category.name, url: `/categories/${category.slug}` },
        ]}
      />

      <main className="bg-surface text-on-surface min-h-screen">
        {/* Header Hero */}
        <section className="relative pt-28 md:pt-36 pb-16 px-5 md:px-10 lg:px-16 border-b border-outline-variant bg-background">
          <div className="mx-auto max-w-[1400px]">
            <Link
              href="/products"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-background text-on-surface transition hover:bg-primary hover:text-background mb-8"
              aria-label="Back to all products"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>

            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              {'// CATEGORY CATALOG'}
            </p>

            <h1 className="mt-4 font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl">
              {category.name}
            </h1>

            {category.description && (
              <p className="mt-6 max-w-[640px] text-sm md:text-base leading-7 text-secondary">
                {category.description}
              </p>
            )}

            <div className="mt-8 flex items-center gap-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c00]" />
              <p className="font-label text-xs font-black uppercase tracking-[0.2em] text-secondary">
                {products.length} {products.length === 1 ? 'item' : 'items'} available
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
                        {category.name}
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
