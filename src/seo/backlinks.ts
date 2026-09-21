import { SITE_URL, DEFAULT_SEO } from './config';

/**
 * Generate shareable URLs for off-page social distribution
 */
export function getSocialShareUrls({
  url,
  title,
  image,
}: {
  url: string;
  title: string;
  image?: string;
}) {
  const fullUrl = encodeURIComponent(url.startsWith('http') ? url : `${SITE_URL}${url}`);
  const text = encodeURIComponent(title);
  const media = image ? encodeURIComponent(image) : '';

  return {
    twitter: `https://twitter.com/intent/tweet?url=${fullUrl}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${fullUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${fullUrl}&media=${media}&description=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${fullUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${fullUrl}`,
  };
}

/**
 * Build breadcrumb trail navigation with anchor link data
 */
export function buildBreadcrumbsTrail(segments: Array<{ name: string; path?: string }>) {
  const breadcrumbs = [{ name: 'Home', url: '/' }];

  let currentPath = '';
  for (const seg of segments) {
    if (seg.path) {
      currentPath = seg.path.startsWith('/') ? seg.path : `/${seg.path}`;
    } else {
      currentPath += `/${seg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    }
    breadcrumbs.push({
      name: seg.name,
      url: currentPath,
    });
  }

  return breadcrumbs;
}

/**
 * Return official social backlinks for knowledge graph and off-page presence
 */
export function getOfficialBrandLinks() {
  return DEFAULT_SEO.organization.sameAs;
}
