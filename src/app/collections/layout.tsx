import React from 'react';
import type { Metadata } from 'next';
import { generateStaticPageMetadata, BreadcrumbJsonLd } from '@/seo';

export const metadata: Metadata = generateStaticPageMetadata({
  title: 'Curated Collections & Seasonal Drops',
  description:
    'Discover seasonal drops and limited capsules from VELOUR. Thoughtfully engineered garments combining urban utility and refined aesthetics.',
  path: '/collections',
  keywords: ['collections', 'capsule collection', 'seasonal drop', 'velour collection', 'urban luxury'],
});

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Collections', url: '/collections' },
        ]}
      />
      {children}
    </>
  );
}
