// ──────────────────────────────────────────────
// SEO Module Types (matching ERD)
// ──────────────────────────────────────────────

/** Global SEO settings — singleton document in `seo_settings` */
export interface SeoSettings {
  _id: string;
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  favicon: string;
  logo: string;
  canonicalDomain: string;
  schemaOrganization: Record<string, unknown>;
  schemaWebsite: Record<string, unknown>;
  googleVerification: string;
  bingVerification: string;
  yandexVerification: string;
  indexNowKey: string;
  robotsDefault: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Robots.txt — singleton document in `robots` */
export interface RobotsConfig {
  _id: string;
  content: string;
  updatedBy: string;
  updatedAt: Date;
}

/** Sitemap configuration — singleton document in `sitemap` */
export interface SitemapConfig {
  _id: string;
  enabled: boolean;
  autoGenerate: boolean;
  includeProducts: boolean;
  includeCategories: boolean;
  includeBrands: boolean;
  includePages: boolean;
  includeImages: boolean;
  lastGenerated: Date | null;
}

/** Individual sitemap entry in `sitemap_items` */
export interface SitemapItem {
  _id: string;
  entityType: 'product' | 'category' | 'brand' | 'page' | 'static';
  entityId: string;
  url: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified: Date;
  include: boolean;
}

/** Redirect type */
export type RedirectType = 301 | 302 | 307 | 308;

/** URL redirect in `redirects` */
export interface Redirect {
  _id: string;
  from: string;
  to: string;
  type: RedirectType;
  hits: number;
  isActive: boolean;
  createdAt: Date;
}

/** Analytics/tracking settings — singleton document in `analytics_settings` */
export interface AnalyticsSettings {
  _id: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  microsoftClarityId: string;
  hotjarId: string;
  tiktokPixelId: string;
  snapchatPixelId: string;
  linkedInInsightId: string;
  customScriptsHead: string;
  customScriptsBody: string;
  customScriptsFooter: string;
}

// ── Payloads ──────────────────────────────────

export type UpdateSeoSettingsPayload = Partial<Omit<SeoSettings, '_id' | 'createdAt' | 'updatedAt'>>;
export type UpdateRobotsPayload = { content: string };
export type UpdateSitemapConfigPayload = Partial<Omit<SitemapConfig, '_id' | 'lastGenerated'>>;
export type UpdateAnalyticsSettingsPayload = Partial<Omit<AnalyticsSettings, '_id'>>;

export interface CreateRedirectPayload {
  from: string;
  to: string;
  type?: RedirectType;
  isActive?: boolean;
}

export interface UpdateRedirectPayload {
  _id: string;
  from?: string;
  to?: string;
  type?: RedirectType;
  isActive?: boolean;
}
