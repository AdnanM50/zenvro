import { BrandModel } from '@/models/brand.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('BrandModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a brand with default SEO and active status', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const brand = await BrandModel.create({
        name: 'Nike',
        logo: 'https://example.com/logo.png',
      });

      expect(brand.name).toBe('Nike');
      expect(brand.slug).toBe('nike');
      expect(brand.isActive).toBe(true);
      expect(brand.seo?.robots).toBe('index');
    });
  });

  describe('toggleActive()', () => {
    it('toggles brand active status successfully', async () => {
      mockCollection.findOne.mockResolvedValue({ _id: 'b1', name: 'Nike', isActive: true });
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await BrandModel.toggleActive('b1');
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'b1' },
        expect.objectContaining({ $set: expect.objectContaining({ isActive: false }) })
      );
    });

    it('returns false when toggling a non-existent brand (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const success = await BrandModel.toggleActive('invalid-id');
      expect(success).toBe(false);
    });
  });
});
