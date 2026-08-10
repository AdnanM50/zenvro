import { MetadataRoute } from 'next';
import { PageModel } from '@/models/page.model';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com';

  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/collections',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  try {
    const cmsPages = await PageModel.findAll({ status: 'published' });

    const dynamicPages = cmsPages.map((page) => ({
      url: `${baseUrl}/${page.slug.replace(/^\//, '')}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...dynamicPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticRoutes;
  }
}
