import React from 'react';
import type { Metadata } from 'next';
import { generateStaticPageMetadata, BreadcrumbJsonLd } from '@/seo';

export const metadata: Metadata = generateStaticPageMetadata({
  title: 'All Products & Contemporary Apparel',
  description:
    'Explore the complete VELOUR collection: tailored jackets, minimalist streetwear, sustainable outerwear, and timeless wardrobe staples.',
  path: '/products',
  keywords: ['all products', 'menswear', 'womenswear', 'streetwear', 'jackets', 'coats', 'outerwear'],
});

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Products', url: '/products' },
        ]}
      />
      {children}
    </>
  );
}
