import React from 'react';
import { SITE_URL, SITE_NAME, DEFAULT_SEO } from './config';

/**
 * Base helper component to render safe JSON-LD script
 */
export function JsonLdScript({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

/**
 * Organization Schema.org JSON-LD (Off-page / Brand Knowledge Graph authority)
 */
export function OrganizationJsonLd({
  name = DEFAULT_SEO.organization.name,
  url = DEFAULT_SEO.organization.url,
  logo = DEFAULT_SEO.organization.logo,
  sameAs = DEFAULT_SEO.organization.sameAs,
}: {
  name?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    legalName: DEFAULT_SEO.organization.legalName,
    url,
    logo,
    foundingDate: DEFAULT_SEO.organization.foundingDate,
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: DEFAULT_SEO.organization.contactPoint.telephone,
      contactType: DEFAULT_SEO.organization.contactPoint.contactType,
      areaServed: DEFAULT_SEO.organization.contactPoint.areaServed,
      availableLanguage: DEFAULT_SEO.organization.contactPoint.availableLanguage,
    },
  };

  return <JsonLdScript data={schema} />;
}

/**
 * WebSite Schema with Sitelinks SearchBox for Google SERP
 */
export function WebSiteJsonLd({
  name = SITE_NAME,
  url = SITE_URL,
}: {
  name?: string;
  url?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLdScript data={schema} />;
}

/**
 * BreadcrumbList Schema for Google Rich Snippets breadcrumbs
 */
export type BreadcrumbItem = {
  name: string;
  url: string;
};

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return <JsonLdScript data={schema} />;
}

/**
 * Product Schema for eCommerce rich snippets (Pricing, In Stock, Rating, Brand, Images)
 */
export type ProductJsonLdProps = {
  name: string;
  description?: string;
  images?: string[];
  sku?: string;
  mpn?: string;
  brand?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  url?: string;
  ratingValue?: number;
  reviewCount?: number;
  category?: string;
};

export function ProductJsonLd({
  name,
  description,
  images = [],
  sku,
  mpn,
  brand = SITE_NAME,
  price,
  currency = 'USD',
  availability = 'InStock',
  url,
  ratingValue,
  reviewCount,
  category,
}: ProductJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description: description || `${name} by ${brand}`,
    image: images.length > 0 ? images : [DEFAULT_SEO.defaultOgImage],
    sku: sku || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    mpn: mpn || sku,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      price: price.toFixed(2),
      priceCurrency: currency,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: `https://schema.org/${availability}`,
      url: url?.startsWith('http') ? url : `${SITE_URL}${url || ''}`,
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
      },
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  if (category) {
    schema.category = category;
  }

  if (ratingValue && reviewCount && reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return <JsonLdScript data={schema} />;
}

/**
 * Collection / ItemList Schema for Category and Collection pages
 */
export type CollectionJsonLdProps = {
  name: string;
  description?: string;
  url: string;
  items?: Array<{ name: string; url: string; image?: string }>;
};

export function CollectionJsonLd({
  name,
  description,
  url,
  items = [],
}: CollectionJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: description || `Shop the latest ${name} collection at ${SITE_NAME}`,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
  };

  if (items.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 24).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        ...(item.image ? { image: item.image } : {}),
      })),
    };
  }

  return <JsonLdScript data={schema} />;
}

/**
 * Brand Schema for Brand landing pages
 */
export function BrandJsonLd({
  name,
  description,
  logo,
  url,
  sameAs = [],
}: {
  name: string;
  description?: string;
  logo?: string;
  url: string;
  sameAs?: string[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name,
    description,
    url: url.startsWith('http') ? url : `${SITE_URL}${url}`,
    ...(logo ? { logo } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return <JsonLdScript data={schema} />;
}

/**
 * FAQ Schema for rich snippet question-and-answer accordions
 */
export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  if (!items || items.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLdScript data={schema} />;
}
