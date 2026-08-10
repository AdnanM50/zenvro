const PAGE_ROUTES: Record<string, string> = {
  'about-us': '/about',
  'contact-us': '/contact',
  'privacy-policy': '/privacy',
  'terms-conditions': '/terms',
};

export function getPagePublicPath(slug: string): string {
  const normalized = slug.replace(/^\/+/, '');
  return PAGE_ROUTES[normalized] || `/${normalized}`;
}
