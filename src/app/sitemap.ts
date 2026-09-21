import type { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';
import { SitemapModel } from '@/models/sitemap.model';
import { SITE_URL } from '@/seo/config';

export const revalidate = 3600; // Revalidate dynamic sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Fallback static pages
  const defaultStaticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  try {
    const config = await SitemapModel.getConfig().catch(() => ({
      enabled: true,
      includeProducts: true,
      includeCategories: true,
      includeBrands: true,
      includePages: true,
      includeImages: true,
    }));

    if (!config.enabled) {
      return defaultStaticRoutes;
    }

    const db = await getDb();
    const dynamicRoutes: MetadataRoute.Sitemap = [...defaultStaticRoutes];

    // 1. Published Products
    if (config.includeProducts) {
      try {
        const products = await db
          .collection('products')
          .find({ status: 'published' })
          .project({ slug: 1, updatedAt: 1, images: 1, seo: 1 })
          .toArray();

        for (const p of products) {
          if (!p.slug) continue;
          if (p.seo?.sitemap?.include === false) continue;

          dynamicRoutes.push({
            url: `${baseUrl}/products/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            changeFrequency: (p.seo?.sitemap?.changefreq as MetadataRoute.Sitemap[number]['changeFrequency']) || 'daily',
            priority: p.seo?.sitemap?.priority ?? 0.9,
            ...(p.images && p.images.length > 0 ? { images: p.images.slice(0, 5) } : {}),
          });
        }
      } catch (err) {
        console.error('Sitemap product fetch error:', err);
      }
    }

    // 2. Active Collections
    try {
      const collections = await db
        .collection('collections')
        .find({ isActive: { $ne: false } })
        .project({ slug: 1, updatedAt: 1, image: 1 })
        .toArray();

      for (const col of collections) {
        if (!col.slug) continue;
        dynamicRoutes.push({
          url: `${baseUrl}/collections/${col.slug}`,
          lastModified: col.updatedAt ? new Date(col.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
          ...(col.image ? { images: [col.image] } : {}),
        });
      }
    } catch (err) {
      console.error('Sitemap collection fetch error:', err);
    }

    // 3. Active Categories
    if (config.includeCategories) {
      try {
        const categories = await db
          .collection('categories')
          .find({ isActive: { $ne: false } })
          .project({ slug: 1, updatedAt: 1, image: 1 })
          .toArray();

        for (const cat of categories) {
          if (!cat.slug) continue;
          dynamicRoutes.push({
            url: `${baseUrl}/categories/${cat.slug}`,
            lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            ...(cat.image ? { images: [cat.image] } : {}),
          });
        }
      } catch (err) {
        console.error('Sitemap category fetch error:', err);
      }
    }

    // 4. Active Brands
    if (config.includeBrands) {
      try {
        const brands = await db
          .collection('brands')
          .find({ isActive: { $ne: false } })
          .project({ slug: 1, updatedAt: 1, logo: 1 })
          .toArray();

        for (const brand of brands) {
          if (!brand.slug) continue;
          dynamicRoutes.push({
            url: `${baseUrl}/brands/${brand.slug}`,
            lastModified: brand.updatedAt ? new Date(brand.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
            ...(brand.logo ? { images: [brand.logo] } : {}),
          });
        }
      } catch (err) {
        console.error('Sitemap brand fetch error:', err);
      }
    }

    // 5. Published CMS Pages
    if (config.includePages) {
      try {
        const pages = await db
          .collection('pages')
          .find({ status: 'published' })
          .project({ slug: 1, updatedAt: 1 })
          .toArray();

        for (const page of pages) {
          if (!page.slug || page.slug === 'home') continue;
          // Avoid duplicate routes that are already in static
          if (['about', 'contact', 'privacy', 'terms'].includes(page.slug)) continue;

          dynamicRoutes.push({
            url: `${baseUrl}/${page.slug}`,
            lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
          });
        }
      } catch (err) {
        console.error('Sitemap pages fetch error:', err);
      }
    }

    return dynamicRoutes;
  } catch (error) {
    console.error('Critical sitemap generation error:', error);
    return defaultStaticRoutes;
  }
}
