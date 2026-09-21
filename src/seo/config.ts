/**
 * Centralized SEO Configuration for Zenvro / Velour
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://zenvro.com';

export const SITE_NAME = 'VELOUR';
export const SITE_TAGLINE = 'Curated Urban Luxury & Contemporary Fashion';

export const DEFAULT_SEO = {
  siteName: SITE_NAME,
  defaultTitle: `${SITE_NAME} | ${SITE_TAGLINE}`,
  titleTemplate: `%s | ${SITE_NAME}`,
  defaultDescription:
    'Discover thoughtful silhouettes, sustainable outerwear, limited archive drops, and handcrafted apparel designed for modern living.',
  defaultKeywords: [
    'velour fashion',
    'urban streetwear',
    'luxury apparel',
    'sustainable outerwear',
    'minimalist clothing',
    'designer jackets',
    'contemporary menswear',
    'contemporary womenswear',
    'archive drops',
    'premium fashion brand',
  ],
  defaultOgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
  defaultTwitterHandle: '@velourofficial',
  themeColor: '#0a0a0a',
  backgroundColor: '#000000',
  locale: 'en_US',
  currency: 'USD',
  robotsDefault: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  organization: {
    name: SITE_NAME,
    legalName: 'Velour Apparel Group Inc.',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/logo.png`,
    foundingDate: '2018',
    founders: ['Velour Studio Design Team'],
    contactPoint: {
      telephone: '+1-800-555-0199',
      contactType: 'customer service',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'French', 'Japanese'],
    },
    sameAs: [
      'https://www.instagram.com/velourofficial',
      'https://twitter.com/velourofficial',
      'https://facebook.com/velourofficial',
      'https://pinterest.com/velourofficial',
      'https://tiktok.com/@velourofficial',
      'https://linkedin.com/company/velour-apparel',
    ],
  },
};
