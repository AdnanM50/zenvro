import { MetadataRoute } from 'next';
import { SitemapModel } from '@/models/sitemap.model';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com';

  try {
    const config = await SitemapModel.getConfig();

    if (!config.enabled) {
      return [];
    }

    // Auto-regenerate if configured
    if (config.autoGenerate) {
      await SitemapModel.regenerate();
    }

    const items = await SitemapModel.findAllItems({ include: true });

    if (items.length > 0) {
      return items.map((item) => ({
        url: item.url,
        lastModified: item.lastModified ? new Date(item.lastModified).toISOString() : new Date().toISOString(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
      }));
    }
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
  }

  // Fallback: static routes
  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
