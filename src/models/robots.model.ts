import { getDb } from '@/lib/db';
import type { RobotsConfig } from '@/types';

const COLLECTION = 'robots';
const SINGLETON_ID = 'global_robots';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

const DEFAULT_CONTENT = `# Robots.txt for VELOUR
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/admin/
Disallow: /login
Disallow: /signup
Disallow: /forgot-password
Disallow: /user-dashboard/

# Sitemaps
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com'}/sitemap.xml
`;

export const RobotsModel = {
  async get(): Promise<RobotsConfig> {
    const c = await col();
    const existing = await c.findOne({ _id: SINGLETON_ID });
    if (existing) return existing as RobotsConfig;

    const doc: RobotsConfig = {
      _id: SINGLETON_ID,
      content: DEFAULT_CONTENT,
      updatedBy: 'system',
      updatedAt: new Date(),
    };
    await c.insertOne(doc);
    return doc;
  },

  async update(content: string, updatedBy: string): Promise<RobotsConfig> {
    const c = await col();
    await this.get();
    await c.updateOne(
      { _id: SINGLETON_ID },
      { $set: { content, updatedBy, updatedAt: new Date() } }
    );
    return this.get();
  },
};
