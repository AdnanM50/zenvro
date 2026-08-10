import type { AnalyticsSettings, UpdateAnalyticsSettingsPayload } from '@/types';
import { httpGet, httpPatch } from '@/lib/http-client';

const API_BASE_URL = '/api/admin/seo/analytics';

/**
 * Fetch current analytics settings
 */
export function getAnalyticsSettings() {
  return httpGet<AnalyticsSettings>(API_BASE_URL);
}

/**
 * Update analytics settings
 */
export function updateAnalyticsSettings(payload: UpdateAnalyticsSettingsPayload) {
  return httpPatch<AnalyticsSettings>(API_BASE_URL, payload);
}
