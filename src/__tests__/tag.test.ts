import { TagModel } from '@/models/tag.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('TagModel & Service Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a tag with auto-generated slug when slug is not provided', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const result = await TagModel.create({ name: 'Summer Collection' });

      expect(result.name).toBe('Summer Collection');
      expect(result.slug).toBe('summer-collection');
      expect(result._id).toBeDefined();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Summer Collection',
        slug: 'summer-collection',
      }));
    });

    it('creates a tag with custom provided slug', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const result = await TagModel.create({ name: 'Special Sale', slug: 'custom-sale-slug' });

      expect(result.slug).toBe('custom-sale-slug');
    });
  });

  describe('findById() & findBySlug()', () => {
    it('finds tag by ID', async () => {
      const mockTag = { _id: 'tag123', name: 'Shoes', slug: 'shoes' };
      mockCollection.findOne.mockResolvedValue(mockTag);

      const found = await TagModel.findById('tag123');
      expect(found).toEqual(mockTag);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'tag123' });
    });

    it('returns null when tag ID is not found (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const found = await TagModel.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findPaginated()', () => {
    it('handles pagination and search correctly', async () => {
      const mockTags = [{ _id: '1', name: 'Electronics', slug: 'electronics' }];
      const toArrayMock = jest.fn().mockResolvedValue(mockTags);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(1);

      const result = await TagModel.findPaginated(1, 10, 'elec');

      expect(result.tags).toEqual(mockTags);
      expect(result.total).toBe(1);
    });
  });

  describe('update() & delete()', () => {
    it('returns true on successful update', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const updated = await TagModel.update('tag123', { name: 'Updated Tag' });
      expect(updated).toBe(true);
    });

    it('returns false on update when tag does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const updated = await TagModel.update('invalid-id', { name: 'Updated Tag' });
      expect(updated).toBe(false);
    });

    it('returns true on successful delete', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const deleted = await TagModel.delete('tag123');
      expect(deleted).toBe(true);
    });

    it('returns false on delete when tag does not exist (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const deleted = await TagModel.delete('invalid-id');
      expect(deleted).toBe(false);
    });
  });
});
