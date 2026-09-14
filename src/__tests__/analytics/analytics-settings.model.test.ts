import { AnalyticsSettingsModel } from '@/models/analytics-settings.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('AnalyticsSettingsModel Unit Tests', () => {
  const mockCollection = {
    findOne: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => mockCollection,
    });
  });

  describe('get()', () => {
    it('returns existing analytics settings from collection', async () => {
      const existingSettings = {
        _id: 'global_analytics',
        googleAnalyticsId: 'G-123456',
        googleTagManagerId: 'GTM-7890',
        facebookPixelId: '12345678',
        microsoftClarityId: 'clarity1',
        hotjarId: 'hj1',
        tiktokPixelId: 'tt1',
        snapchatPixelId: 'sc1',
        linkedInInsightId: 'li1',
        customScriptsHead: '<script></script>',
        customScriptsBody: '<div>body</div>',
        customScriptsFooter: '<div>footer</div>',
      };
      mockCollection.findOne.mockResolvedValue(existingSettings);

      const res = await AnalyticsSettingsModel.get();
      expect(res).toEqual(existingSettings);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'global_analytics' });
    });

    it('creates and returns default singleton document when not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const res = await AnalyticsSettingsModel.get();
      expect(res._id).toBe('global_analytics');
      expect(res.googleAnalyticsId).toBe('');
      expect(res.snapchatPixelId).toBe('');
      expect(res.linkedInInsightId).toBe('');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({ _id: 'global_analytics' })
      );
    });
  });

  describe('update()', () => {
    it('updates analytics settings document successfully', async () => {
      const mockUpdated = {
        _id: 'global_analytics',
        googleAnalyticsId: 'G-999999',
        googleTagManagerId: 'GTM-9999',
        facebookPixelId: '88888888',
        microsoftClarityId: 'clarity2',
        hotjarId: 'hj2',
        tiktokPixelId: 'tt2',
        snapchatPixelId: 'sc2',
        linkedInInsightId: 'li2',
        customScriptsHead: '<meta name="test" />',
        customScriptsBody: '',
        customScriptsFooter: '<script>footer</script>',
      };

      // get() call in update -> findOne
      mockCollection.findOne.mockResolvedValueOnce({ _id: 'global_analytics' });
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
      // get() call at return -> findOne
      mockCollection.findOne.mockResolvedValueOnce(mockUpdated);

      const res = await AnalyticsSettingsModel.update({
        googleAnalyticsId: 'G-999999',
        snapchatPixelId: 'sc2',
      });

      expect(res).toEqual(mockUpdated);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'global_analytics' },
        { $set: expect.objectContaining({ googleAnalyticsId: 'G-999999', snapchatPixelId: 'sc2' }) }
      );
    });
  });
});
