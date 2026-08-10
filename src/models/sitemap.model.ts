import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { SitemapConfig, SitemapItem } from '@/types';

const CONFIG_COLLECTION = 'sitemap';
const ITEMS_COLLECTION = 'sitemap_items';
const SINGLETON_ID = 'global_sitemap';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function configCol(): Promise<any> {
  const db = await getDb();
  return db.collection(CONFIG_COLLECTION);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function itemsCol(): Promise<any> {
  const db = await getDb();
  return db.collection(ITEMS_COLLECTION);
}

export const SitemapModel = {
  // ── Config ──────────────────────────────────
  async getConfig(): Promise<SitemapConfig> {
    const c = await configCol();
    const existing = await c.findOne({ _id: SINGLETON_ID });
    if (existing) return existing as SitemapConfig;

    const doc: SitemapConfig = {
      _id: SINGLETON_ID,
      enabled: true,
      autoGenerate: true,
      includeProducts: true,
      includeCategories: true,
      includeBrands: true,
      includePages: true,
      includeImages: false,
      lastGenerated: null,
    };
    await c.insertOne(doc);
    return doc;
  },

  async updateConfig(data: Partial<Omit<SitemapConfig, '_id' | 'lastGenerated'>>): Promise<SitemapConfig> {
    const c = await configCol();
    await this.getConfig();
    await c.updateOne(
      { _id: SINGLETON_ID },
      { $set: { ...data } }
    );
    return this.getConfig();
  },

  // ── Items ───────────────────────────────────
  async findAllItems(filter?: { entityType?: string; include?: boolean }): Promise<SitemapItem[]> {
    const c = await itemsCol();
    const q: Record<string, unknown> = {};
    if (filter?.entityType) q.entityType = filter.entityType;
    if (filter?.include !== undefined) q.include = filter.include;
    return c.find(q).sort({ entityType: 1, url: 1 }).toArray();
  },

  async upsertItem(item: Omit<SitemapItem, '_id'>): Promise<SitemapItem> {
    const c = await itemsCol();
    const existing = await c.findOne({ entityType: item.entityType, entityId: item.entityId });
    if (existing) {
      await c.updateOne(
        { _id: existing._id },
        { $set: { ...item } }
      );
      return { ...existing, ...item };
    }
    const doc: SitemapItem = { _id: generateObjectId(), ...item };
    await c.insertOne(doc);
    return doc;
  },

  async removeItem(entityType: string, entityId: string): Promise<boolean> {
    const c = await itemsCol();
    const result = await c.deleteOne({ entityType, entityId });
    return result.deletedCount > 0;
  },

  async clearItemsByType(entityType: string): Promise<number> {
    const c = await itemsCol();
    const result = await c.deleteMany({ entityType });
    return result.deletedCount;
  },

  async countItems(): Promise<Record<string, number>> {
    const c = await itemsCol();
    const all = await c.find({}).toArray();
    const counts: Record<string, number> = { total: all.length };
    for (const item of all) {
      counts[item.entityType] = (counts[item.entityType] || 0) + 1;
    }
    return counts;
  },

  // ── Regeneration ────────────────────────────
  async regenerate(): Promise<{ count: number }> {
    const config = await this.getConfig();
    const db = await getDb();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com';
    let count = 0;

    // Static pages
    const staticPages = [
      { url: '/', priority: 1.0, freq: 'daily' as const },
      { url: '/about', priority: 0.8, freq: 'monthly' as const },
      { url: '/products', priority: 0.9, freq: 'daily' as const },
      { url: '/contact', priority: 0.6, freq: 'monthly' as const },
    ];

    for (const sp of staticPages) {
      await this.upsertItem({
        entityType: 'static',
        entityId: sp.url,
        url: `${baseUrl}${sp.url === '/' ? '' : sp.url}`,
        priority: sp.priority,
        changeFrequency: sp.freq,
        lastModified: new Date(),
        include: true,
      });
      count++;
    }

    // Products
    if (config.includeProducts) {
      const products = await db.collection('products').find({ status: 'active' }).toArray();
      for (const p of products) {
        await this.upsertItem({
          entityType: 'product',
          entityId: String(p._id),
          url: `${baseUrl}/products/${p.slug}`,
          priority: 0.8,
          changeFrequency: 'weekly',
          lastModified: p.updatedAt || new Date(),
          include: true,
        });
        count++;
      }
    }

    // Categories
    if (config.includeCategories) {
      const categories = await db.collection('categories').find({ isActive: true }).toArray();
      for (const cat of categories) {
        await this.upsertItem({
          entityType: 'category',
          entityId: String(cat._id),
          url: `${baseUrl}/categories/${cat.slug}`,
          priority: 0.7,
          changeFrequency: 'weekly',
          lastModified: cat.updatedAt || new Date(),
          include: true,
        });
        count++;
      }
    }

    // Brands
    if (config.includeBrands) {
      const brands = await db.collection('brands').find({ isActive: true }).toArray();
      for (const brand of brands) {
        await this.upsertItem({
          entityType: 'brand',
          entityId: String(brand._id),
          url: `${baseUrl}/brands/${brand.slug}`,
          priority: 0.6,
          changeFrequency: 'monthly',
          lastModified: brand.updatedAt || new Date(),
          include: true,
        });
        count++;
      }
    }

    // CMS Pages
    if (config.includePages) {
      const pages = await db.collection('pages').find({ status: 'published' }).toArray();
      for (const page of pages) {
        const slug = page.slug === 'home' ? '' : `/${page.slug}`;
        await this.upsertItem({
          entityType: 'page',
          entityId: String(page._id),
          url: `${baseUrl}${slug}`,
          priority: 0.7,
          changeFrequency: 'monthly',
          lastModified: page.updatedAt || new Date(),
          include: true,
        });
        count++;
      }
    }

    // Update lastGenerated timestamp
    const cc = await configCol();
    await cc.updateOne(
      { _id: SINGLETON_ID },
      { $set: { lastGenerated: new Date() } }
    );

    return { count };
  },
};
