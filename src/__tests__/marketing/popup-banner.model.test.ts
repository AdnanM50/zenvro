import { PopupBannerModel } from '@/models/popup-banner.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('PopupBannerModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a banner with the full schema', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const banner = await PopupBannerModel.create({
        title: 'New Season',
        description: 'Great deals',
        imageUrl: 'https://img.com/a.png',
        buttonText: 'Shop Now',
        buttonLink: '/products',
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: 'active',
        sortOrder: 2,
      });

      expect(banner._id).toBeDefined();
      expect(banner.title).toBe('New Season');
      expect(banner.description).toBe('Great deals');
      expect(banner.imageUrl).toBe('https://img.com/a.png');
      expect(banner.buttonText).toBe('Shop Now');
      expect(banner.buttonLink).toBe('/products');
      expect(banner.startDate).toBe('2025-06-01');
      expect(banner.endDate).toBe('2025-06-30');
      expect(banner.status).toBe('active');
      expect(banner.sortOrder).toBe(2);
      expect(banner.createdAt).toBeInstanceOf(Date);
      expect(banner.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a banner with a minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const banner = await PopupBannerModel.create({ title: 'Minimal' });

      expect(banner.status).toBe('inactive');
      expect(banner.sortOrder).toBe(0);
      expect(banner.description).toBeUndefined();
      expect(banner.imageUrl).toBeUndefined();
      expect(banner.buttonText).toBeUndefined();
      expect(banner.buttonLink).toBeUndefined();
      expect(banner.startDate).toBeUndefined();
      expect(banner.endDate).toBeUndefined();
    });

    it('trims string fields and drops whitespace-only values', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const banner = await PopupBannerModel.create({
        title: '  Spaced Title  ',
        description: '   ',
        imageUrl: '',
      });

      expect(banner.title).toBe('Spaced Title');
      expect(banner.description).toBeUndefined();
      expect(banner.imageUrl).toBeUndefined();
    });

    it('coerces invalid numeric input instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const banner = await PopupBannerModel.create({
        title: 'Bad Numbers',
        // @ts-expect-error testing defensive coercion against garbage input
        sortOrder: 'abc',
      });

      expect(banner.sortOrder).toBe(0);
    });
  });

  describe('findById()', () => {
    it('returns the matching banner', async () => {
      const found = { _id: 'b1', title: 'Banner' };
      mockCollection.findOne.mockResolvedValue(found);

      const banner = await PopupBannerModel.findById('b1');
      expect(banner).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'b1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const banner = await PopupBannerModel.findById('missing');
      expect(banner).toBeNull();
    });
  });

  describe('findPaginated()', () => {
    const chain = (toArrayValue: unknown[]) => {
      const toArrayMock = jest.fn().mockResolvedValue(toArrayValue);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });
      return { sortMock, toArrayMock };
    };

    it('returns banners and total count', async () => {
      const banners = [{ _id: 'b1', title: 'A' }, { _id: 'b2', title: 'B' }];
      const { sortMock } = chain(banners);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await PopupBannerModel.findPaginated(1, 10);
      expect(result.banners).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty list gracefully (Edge case)', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await PopupBannerModel.findPaginated(5, 20);
      expect(result.banners).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies a title regex filter when a search term is provided', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await PopupBannerModel.findPaginated(1, 10, { search: 'sale' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([{ title: { $regex: 'sale', $options: 'i' } }]);
    });

    it('applies a status filter', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await PopupBannerModel.findPaginated(1, 10, { status: 'active' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter).toEqual({ status: 'active' });
    });
  });

  describe('update()', () => {
    it('updates a banner and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await PopupBannerModel.update('b1', { title: 'Updated' });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'b1' },
        expect.objectContaining({ $set: expect.objectContaining({ title: 'Updated' }) })
      );
    });

    it('returns false when the banner does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await PopupBannerModel.update('missing', { title: 'X' });
      expect(success).toBe(false);
    });

    it('stamps updatedAt on every update', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await PopupBannerModel.update('b1', { status: 'active' });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete()', () => {
    it('deletes a banner and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await PopupBannerModel.delete('b1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'b1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await PopupBannerModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('findAll()', () => {
    it('returns every banner sorted by sort order then newest first', async () => {
      const banners = [{ _id: 'b1' }, { _id: 'b2' }];
      const toArrayMock = jest.fn().mockResolvedValue(banners);
      const sortMock = jest.fn().mockReturnValue({ toArray: toArrayMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });

      const result = await PopupBannerModel.findAll();
      expect(result).toEqual(banners);
      expect(sortMock).toHaveBeenCalledWith({ sortOrder: 1, createdAt: -1 });
    });
  });

  describe('count()', () => {
    it('returns the total banner count', async () => {
      mockCollection.countDocuments.mockResolvedValue(7);

      const count = await PopupBannerModel.count();
      expect(count).toBe(7);
    });
  });
});
