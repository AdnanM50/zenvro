import { getDb } from '@/lib/db';
import type { AnalyticsSettings, UpdateAnalyticsSettingsPayload } from '@/types';

const COLLECTION = 'analytics_settings';
const SINGLETON_ID = 'global_analytics';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

const DEFAULT_ANALYTICS: Omit<AnalyticsSettings, '_id'> = {
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  microsoftClarityId: '',
  hotjarId: '',
  tiktokPixelId: '',
  snapchatPixelId: '',
  linkedInInsightId: '',
  customScriptsHead: '',
  customScriptsBody: '',
  customScriptsFooter: '',
};

export const AnalyticsSettingsModel = {
  async get(): Promise<AnalyticsSettings> {
    const c = await col();
    const existing = await c.findOne({ _id: SINGLETON_ID });
    if (existing) return existing as AnalyticsSettings;

    const doc: AnalyticsSettings = {
      _id: SINGLETON_ID,
      ...DEFAULT_ANALYTICS,
    };
    await c.insertOne(doc);
    return doc;
  },

  async update(data: UpdateAnalyticsSettingsPayload): Promise<AnalyticsSettings> {
    const c = await col();
    await this.get();
    await c.updateOne(
      { _id: SINGLETON_ID },
      { $set: { ...data } }
    );
    return this.get();
  },
};
