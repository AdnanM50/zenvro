import { GalleryModel } from '@/models/gallery.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('GalleryModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates an uploaded gallery item with all metadata', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await GalleryModel.create({
        url: 'https://res.cloudinary.com/x/image/upload/v1/velour/a.jpg',
        publicId: 'velour/a',
        title: 'Hero',
        altText: 'Hero image',
        mimeType: 'image/jpeg',
        size: 1024,
        width: 800,
        height: 600,
        source: 'upload',
      });

      expect(item.source).toBe('upload');
      expect(item.publicId).toBe('velour/a');
      expect(item.title).toBe('Hero');
      expect(item.size).toBe(1024);
      expect(item.width).toBe(800);
      expect(item.height).toBe(600);
      expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);
    });

    it('defaults source to "url" when omitted', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await GalleryModel.create({ url: 'https://example.com/x.jpg' });

      expect(item.source).toBe('url');
      expect(item.publicId).toBeUndefined();
    });

    it('coerces missing metadata to empty strings / undefined (Edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await GalleryModel.create({ url: 'https://example.com/x.jpg' });

      expect(item.title).toBe('');
      expect(item.altText).toBe('');
      expect(item.mimeType).toBe('');
      expect(item.size).toBeUndefined();
      expect(item.width).toBeUndefined();
      expect(item.height).toBeUndefined();
    });
  });

  describe('findById()', () => {
    it('returns the found item', async () => {
      const doc = { _id: 'g1', url: 'https://example.com/x.jpg', source: 'url' };
      mockCollection.findOne.mockResolvedValue(doc);

      const item = await GalleryModel.findById('g1');
      expect(item).toEqual(doc);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'g1' });
    });

    it('returns null when nothing is found (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const item = await GalleryModel.findById('missing');
      expect(item).toBeNull();
    });
  });

  describe('findPaginated()', () => {
    it('returns items and total with default (no search) filter', async () => {
      const items = [{ _id: 'g1', url: 'https://example.com/a.jpg' }];
      mockCollection.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue(items) }),
          }),
        }),
      });
      mockCollection.countDocuments.mockResolvedValue(1);

      const result = await GalleryModel.findPaginated(2, 20);
      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(mockCollection.find).toHaveBeenCalledWith({});
    });

    it('builds an $or search filter across title, altText and url', async () => {
      mockCollection.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([]) }),
          }),
        }),
      });
      mockCollection.countDocuments.mockResolvedValue(0);

      await GalleryModel.findPaginated(1, 10, 'hero');
      expect(mockCollection.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: 'hero', $options: 'i' } },
          { altText: { $regex: 'hero', $options: 'i' } },
          { url: { $regex: 'hero', $options: 'i' } },
        ],
      });
    });
  });

  describe('update()', () => {
    it('updates fields and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await GalleryModel.update('g1', { title: 'New Title' });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'g1' },
        expect.objectContaining({ $set: expect.objectContaining({ title: 'New Title' }) }),
      );
    });

    it('returns false when nothing was modified (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await GalleryModel.update('g1', { title: 'Same' });
      expect(success).toBe(false);
    });
  });

  describe('delete()', () => {
    it('deletes the item and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await GalleryModel.delete('g1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'g1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await GalleryModel.delete('missing');
      expect(success).toBe(false);
    });
  });
});
