import { getAnalyticsSettings, updateAnalyticsSettings } from '@/services/analytics.service';
import { httpGet, httpPatch } from '@/lib/http-client';

jest.mock('@/lib/http-client', () => ({
  httpGet: jest.fn(),
  httpPatch: jest.fn(),
}));

describe('Analytics Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAnalyticsSettings calls httpGet with correct API route', async () => {
    const mockResponse = { success: true, data: { googleAnalyticsId: 'G-12345' } };
    (httpGet as jest.Mock).mockResolvedValue(mockResponse);

    const res = await getAnalyticsSettings();
    expect(httpGet).toHaveBeenCalledWith('/api/admin/seo/analytics');
    expect(res).toEqual(mockResponse);
  });

  it('updateAnalyticsSettings calls httpPatch with correct route and payload', async () => {
    const payload = { googleAnalyticsId: 'G-54321', facebookPixelId: '112233' };
    const mockResponse = { success: true, data: { ...payload, _id: 'global_analytics' } };
    (httpPatch as jest.Mock).mockResolvedValue(mockResponse);

    const res = await updateAnalyticsSettings(payload);
    expect(httpPatch).toHaveBeenCalledWith('/api/admin/seo/analytics', payload);
    expect(res).toEqual(mockResponse);
  });
});
