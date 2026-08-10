import type { Metadata } from 'next';
import { PageModel } from '@/models/page.model';
import { SeoSettingsModel } from '@/models/seo-settings.model';

export interface PageMetadataFallback {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
}

function normalizeKeywords(focusKeyword: string | undefined, metaKeywords: string | undefined, additional: string[] | undefined, phrases: string[] | undefined): string[] {
  const all: string[] = [];
  if (focusKeyword) all.push(focusKeyword);
  if (metaKeywords) {
    all.push(
      ...metaKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    );
  }
  if (additional?.length) all.push(...additional);
  if (phrases?.length) all.push(...phrases);
  return [...new Set(all.map((k) => k.toLowerCase()))];
}

export async function buildPageMetadata(
  slug: string,
  path: string,
  fallback: PageMetadataFallback
): Promise<Metadata> {
  let seoSettings;
  try {
    seoSettings = await SeoSettingsModel.get();
  } catch {
    seoSettings = null;
  }

  const BASE_URL = seoSettings?.canonicalDomain || process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com';
  const siteName = seoSettings?.siteName || 'VELOUR';

  let title = fallback.title;
  let description = fallback.description;
  let keywords = normalizeKeywords(
    undefined,
    undefined,
    fallback.keywords || seoSettings?.defaultKeywords,
    undefined
  );
  let ogImage = fallback.ogImage || seoSettings?.defaultOgImage || '';
  let canonicalUrl = `${BASE_URL}${path}`;

  try {
    await PageModel.seedDefaults();
    const page = await PageModel.findBySlug(slug);

    if (page?.seo) {
      if (page.seo.metaTitle) title = page.seo.metaTitle;
      if (page.seo.metaDescription) description = page.seo.metaDescription;
      const hasKeywordSources = Boolean(
        page.seo.focusKeyword ||
          page.seo.metaKeywords ||
          page.seo.additionalKeywords?.length ||
          page.seo.searchPhrases?.length
      );
      if (hasKeywordSources) {
        keywords = normalizeKeywords(
          page.seo.focusKeyword,
          page.seo.metaKeywords,
          page.seo.additionalKeywords,
          page.seo.searchPhrases
        );
      }
      if (page.seo.ogImage) ogImage = page.seo.ogImage;
      if (page.seo.canonicalUrl) canonicalUrl = page.seo.canonicalUrl;
    }
  } catch (error) {
    console.error(`Error generating metadata for '${slug}':`, error);
  }

  const images = ogImage
    ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
        },
      ]
    : undefined;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    keywords,
    authors: [{ name: `${siteName} Atelier`, url: BASE_URL }],
    publisher: `${siteName} International`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: 'en_US',
      type: 'website',
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images ? images.map((img) => img.url) : undefined,
    },
  };
}
