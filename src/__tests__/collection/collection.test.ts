import { CollectionModel } from '@/models/collection.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('CollectionModel Unit Tests (Possible & Impossible Edge Cases)', () => {
  const mockCollection = {
    insertOne: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => mockCollection,
    });
  });

  describe('create()', () => {
    it('creates a collection campaign with start and end dates', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const collectionItem = await CollectionModel.create({
        name: 'Winter Sale 2026',
        banner: 'https://example.com/banner.png',
        startDate: '2026-12-01',
        endDate: '2026-12-31',
      });

      expect(collectionItem.name).toBe('Winter Sale 2026');
      expect(collectionItem.slug).toBe('winter-sale-2026');
      expect(collectionItem.startDate).toBe('2026-12-01');
      expect(collectionItem.endDate).toBe('2026-12-31');
    });
  });

  describe('toggleActive()', () => {
    it('toggles collection active state successfully', async () => {
      mockCollection.findOne.mockResolvedValue({ _id: 'col1', name: 'Winter', isActive: true });
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await CollectionModel.toggleActive('col1');
      expect(result).toBe(true);
    });

    it('returns false when toggling an invalid ID (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await CollectionModel.toggleActive('invalid-id');
      expect(result).toBe(false);
    });
  });
});
