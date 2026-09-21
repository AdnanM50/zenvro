import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME, DEFAULT_SEO } from './config';
import type { Category, Brand, CollectionItem, ProductSEO } from '@/types';

/**
 * Flexible input type supporting DB Product, UI Product, or partial fields
 */
export type ProductMetadataInput = {
  name?: string;
  slug?: string;
  _id?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  brand?: string;
  status?: string;
  featuredImage?: string;
  gallery?: string[];
  image?: string;
  images?: string[];
  regularPrice?: number;
  salePrice?: number;
  price?: number | string;
  stock?: number;
  seo?: Partial<ProductSEO>;
};

/**
 * Format title with standard brand template
 */
export function formatTitle(title?: string): string {
  if (!title) return DEFAULT_SEO.defaultTitle;
  return `${title} | ${SITE_NAME}`;
}

/**
 * Build canonical URL ensuring clean formatting
 */
export function getCanonicalUrl(path = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Dynamic metadata generator for Product Detail Pages
 */
export function generateProductMetadata(product: ProductMetadataInput | null): Metadata {
  if (!product) {
    return {
      title: formatTitle('Product Not Found'),
      description: 'The requested product is currently unavailable or has been archived.',
      robots: { index: false, follow: false },
    };
  }

  const seo = product.seo;
  const title = seo?.title || product.name || 'Exclusive Product';
  const description =
    seo?.description ||
    product.shortDescription ||
    product.description ||
    `Shop ${product.name} at ${SITE_NAME}. Crafted with premium materials for contemporary silhouette and lasting comfort.`;

  const primaryImage =
    seo?.ogImage ||
    product.featuredImage ||
    (product.images && product.images.length > 0 ? product.images[0] : undefined) ||
    product.image ||
    (product.gallery && product.gallery.length > 0 ? product.gallery[0] : undefined) ||
    DEFAULT_SEO.defaultOgImage;

  const images = [
    {
      url: primaryImage,
      width: 1200,
      height: 630,
      alt: `${product.name || 'Product'} - ${SITE_NAME}`,
    },
  ];

  const canonical = seo?.canonical || getCanonicalUrl(`/products/${product.slug || product._id}`);
  const shouldIndex = product.status !== 'archived' && (!seo?.robots || seo.robots.includes('index'));

  const keywords = [
    ...(seo?.keywords || []),
    ...(seo?.focusKeyword ? [seo.focusKeyword] : []),
    product.category || '',
    product.brand || '',
    product.name || '',
    'clothing',
    'apparel',
    'velour',
  ].filter(Boolean);

  const numericPrice =
    typeof product.price === 'number'
      ? product.price
      : typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0
      : product.salePrice ?? product.regularPrice ?? 0;

  return {
    title: formatTitle(title),
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title: seo?.ogTitle || formatTitle(title),
      description: seo?.ogDescription || description,
      url: canonical,
      siteName: SITE_NAME,
      images,
      type: 'website',
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.twitterTitle || seo?.ogTitle || formatTitle(title),
      description: seo?.twitterDescription || seo?.ogDescription || description,
      images: [seo?.twitterImage || primaryImage],
      creator: DEFAULT_SEO.defaultTwitterHandle,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    other: {
      'product:price:amount': String(numericPrice),
      'product:price:currency': DEFAULT_SEO.currency,
      'product:availability': (product.stock ?? 1) > 0 ? 'in stock' : 'out of stock',
      'product:condition': 'new',
      'product:brand': product.brand || SITE_NAME,
    },
  };
}

/**
 * Dynamic metadata generator for Category Pages
 */
export function generateCategoryMetadata(category: Partial<Category> | null): Metadata {
  if (!category) {
    return {
      title: formatTitle('Category Not Found'),
      description: 'The requested category does not exist.',
      robots: { index: false, follow: false },
    };
  }

  const seo = category.seo;
  const title = seo?.title || category.name || 'Collections';
  const description =
    seo?.description ||
    category.description ||
    `Explore curated ${category.name} apparel at ${SITE_NAME}. Modern silhouettes designed with precision.`;

  const ogImage = seo?.ogImage || category.image || DEFAULT_SEO.defaultOgImage;
  const canonical = seo?.canonical || getCanonicalUrl(`/categories/${category.slug || category._id}`);
  const shouldIndex = category.isActive !== false;

  return {
    title: formatTitle(title),
    description,
    keywords: [...(seo?.keywords || []), category.name || '', 'fashion', 'velour'].filter(Boolean),
    alternates: {
      canonical,
    },
    openGraph: {
      title: formatTitle(title),
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${category.name} - ${SITE_NAME}` }],
      type: 'website',
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: formatTitle(title),
      description,
      images: [ogImage],
      creator: DEFAULT_SEO.defaultTwitterHandle,
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
  };
}

/**
 * Dynamic metadata generator for Brand Pages
 */
export function generateBrandMetadata(brand: Partial<Brand> | null): Metadata {
  if (!brand) {
    return {
      title: formatTitle('Brand Not Found'),
      description: 'The requested brand does not exist.',
      robots: { index: false, follow: false },
    };
  }

  const seo = brand.seo;
  const title = seo?.title || brand.name || 'Featured Brand';
  const description =
    seo?.description ||
    brand.description ||
    `Discover ${brand.name} official designs and curated selections at ${SITE_NAME}.`;

  const ogImage = seo?.ogImage || brand.logo || DEFAULT_SEO.defaultOgImage;
  const canonical = seo?.canonical || getCanonicalUrl(`/brands/${brand.slug || brand._id}`);
  const shouldIndex = brand.isActive !== false;

  return {
    title: formatTitle(title),
    description,
    keywords: [...(seo?.keywords || []), brand.name || '', 'designer brands', 'velour'].filter(Boolean),
    alternates: {
      canonical,
    },
    openGraph: {
      title: formatTitle(title),
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${brand.name} - ${SITE_NAME}` }],
      type: 'website',
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: formatTitle(title),
      description,
      images: [ogImage],
      creator: DEFAULT_SEO.defaultTwitterHandle,
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
  };
}

/**
 * Dynamic metadata generator for Collection Pages
 */
export function generateCollectionMetadata(collection: Partial<CollectionItem> | null): Metadata {
  if (!collection) {
    return {
      title: formatTitle('Collection Not Found'),
      description: 'The requested collection is unavailable.',
      robots: { index: false, follow: false },
    };
  }

  const title = collection.name || 'Curated Collection';
  const description =
    collection.description ||
    `Browse the exclusive ${collection.name} drop at ${SITE_NAME}. Limited pieces with premium craftsmanship.`;

  const ogImage = collection.banner || DEFAULT_SEO.defaultOgImage;
  const canonical = getCanonicalUrl(`/collections/${collection.slug || collection._id}`);
  const shouldIndex = collection.isActive !== false;

  return {
    title: formatTitle(title),
    description,
    keywords: [collection.name || '', 'capsule collection', 'limited drop', 'velour'].filter(Boolean),
    alternates: {
      canonical,
    },
    openGraph: {
      title: formatTitle(title),
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${collection.name} - ${SITE_NAME}` }],
      type: 'website',
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: formatTitle(title),
      description,
      images: [ogImage],
      creator: DEFAULT_SEO.defaultTwitterHandle,
    },
    robots: {
      index: shouldIndex,
      follow: true,
    },
  };
}

/**
 * Metadata generator for standard pages (Products catalog, Collections index, About, Contact)
 */
export function generateStaticPageMetadata({
  title,
  description,
  path = '',
  image = DEFAULT_SEO.defaultOgImage,
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const canonical = getCanonicalUrl(path);

  return {
    title: formatTitle(title),
    description,
    keywords: [...DEFAULT_SEO.defaultKeywords, ...keywords],
    alternates: {
      canonical,
    },
    openGraph: {
      title: formatTitle(title),
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: `${title} - ${SITE_NAME}` }],
      type: 'website',
      locale: DEFAULT_SEO.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: formatTitle(title),
      description,
      images: [image],
      creator: DEFAULT_SEO.defaultTwitterHandle,
    },
    robots: DEFAULT_SEO.robotsDefault,
  };
}
