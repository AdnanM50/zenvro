import { httpGet, httpPost, httpPatch, httpDelete, buildQueryString } from '@/lib/http-client';

export interface RedirectItem {
  _id: string;
  from: string;
  to: string;
  type: 301 | 302 | 307 | 308;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRedirectPayload {
  from: string;
  to: string;
  type?: 301 | 302 | 307 | 308;
  isActive?: boolean;
}

export interface UpdateRedirectPayload extends Partial<CreateRedirectPayload> {
  _id: string;
}

export interface SeoSettings {
  siteName?: string;
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  canonicalUrl?: string;
  socialLinks?: Record<string, string>;
  ogImage?: string;
  twitterHandle?: string;
  metaRobots?: string;
}

export interface RobotsConfig {
  userAgents?: Array<{
    userAgent: string;
    allow?: string[];
    disallow?: string[];
    crawlDelay?: number;
  }>;
  sitemapUrl?: string;
}

const REDIRECTS_URL = '/api/admin/seo/redirects';
const SETTINGS_URL = '/api/admin/seo/settings';
const ROBOTS_URL = '/api/admin/seo/robots';
const SITEMAP_URL = '/api/admin/seo/sitemap';

export function getRedirects(params: { page?: number; limit?: number; search?: string } = {}) {
  return httpGet<RedirectItem[]>(`${REDIRECTS_URL}${buildQueryString(params)}`);
}

export function createRedirect(payload: CreateRedirectPayload) {
  return httpPost<RedirectItem>(REDIRECTS_URL, payload);
}

export function updateRedirect(payload: UpdateRedirectPayload) {
  return httpPatch<null>(REDIRECTS_URL, payload);
}

export function deleteRedirect(_id: string) {
  return httpDelete<null>(`${REDIRECTS_URL}?_id=${_id}`);
}

export function getSeoSettings() {
  return httpGet<SeoSettings>(SETTINGS_URL);
}

export function updateSeoSettings(payload: Partial<SeoSettings>) {
  return httpPatch<SeoSettings>(SETTINGS_URL, payload);
}

export function getRobotsConfig() {
  return httpGet<RobotsConfig>(ROBOTS_URL);
}

export function updateRobotsConfig(payload: RobotsConfig) {
  return httpPatch<RobotsConfig>(ROBOTS_URL, payload);
}

export function getSitemapStatus() {
  return httpGet<unknown>(SITEMAP_URL);
}
