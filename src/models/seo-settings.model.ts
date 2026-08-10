import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { SeoSettings, UpdateSeoSettingsPayload } from '@/types';

const COLLECTION = 'seo_settings';
const SINGLETON_ID = 'global_seo_settings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

const DEFAULT_SEO_SETTINGS: Omit<SeoSettings, '_id'> = {
  siteName: 'VELOUR',
  defaultTitle: 'VELOUR | International Fashion',
  titleTemplate: '%s | VELOUR',
  defaultDescription: 'Explore curated collections and everyday essentials thoughtfully designed.',
  defaultKeywords: ['fashion', 'clothing', 'style', 'velour', 'premium'],
  defaultOgImage: '',
  favicon: '',
  logo: '',
  canonicalDomain: process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com',
  schemaOrganization: {
    '@type': 'Organization',
    name: 'VELOUR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com',
  },
  schemaWebsite: {
    '@type': 'WebSite',
    name: 'VELOUR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com',
  },
  googleVerification: '',
  bingVerification: '',
  yandexVerification: '',
  indexNowKey: '',
  robotsDefault: 'index, follow',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const SeoSettingsModel = {
  async get(): Promise<SeoSettings> {
    const c = await col();
    const existing = await c.findOne({ _id: SINGLETON_ID });
    if (existing) return existing as SeoSettings;

    const doc: SeoSettings = {
      _id: SINGLETON_ID,
      ...DEFAULT_SEO_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await c.insertOne(doc);
    return doc;
  },

  async update(data: UpdateSeoSettingsPayload): Promise<SeoSettings> {
    const c = await col();
    // Ensure the document exists
    await this.get();
    await c.updateOne(
      { _id: SINGLETON_ID },
      { $set: { ...data, updatedAt: new Date() } }
    );
    return this.get();
  },
};
