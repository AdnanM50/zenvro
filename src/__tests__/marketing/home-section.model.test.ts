import { HomeSectionModel } from '@/models/home-section.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('HomeSectionModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a section with the full schema', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const section = await HomeSectionModel.create({
        title: 'Featured Products',
        subtitle: 'Handpicked picks',
        sectionType: 'featured-products',
        enabled: true,
        sortOrder: 2,
        productIds: ['p-1', 'p-2'],
        imageUrl: 'https://img.com/banner.png',
        link: '/collections/new',
        linkText: 'Shop Now',
        content: '<p>Hello</p>',
      });

      expect(section._id).toBeDefined();
      expect(section.title).toBe('Featured Products');
      expect(section.subtitle).toBe('Handpicked picks');
      expect(section.sectionType).toBe('featured-products');
      expect(section.enabled).toBe(true);
      expect(section.sortOrder).toBe(2);
      expect(section.productIds).toEqual(['p-1', 'p-2']);
      expect(section.imageUrl).toBe('https://img.com/banner.png');
      expect(section.link).toBe('/collections/new');
      expect(section.linkText).toBe('Shop Now');
      expect(section.content).toBe('<p>Hello</p>');
      expect(section.createdAt).toBeInstanceOf(Date);
      expect(section.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a section with a minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const section = await HomeSectionModel.create({ title: 'Minimal' });

      expect(section.sectionType).toBe('featured-products');
      expect(section.enabled).toBe(true);
      expect(section.sortOrder).toBe(0);
      expect(section.productIds).toEqual([]);
      expect(section.subtitle).toBeUndefined();
      expect(section.imageUrl).toBeUndefined();
      expect(section.link).toBeUndefined();
      expect(section.linkText).toBeUndefined();
      expect(section.content).toBeUndefined();
    });

    it('respects an explicit disabled flag', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const section = await HomeSectionModel.create({ title: 'Hidden', enabled: false });

      expect(section.enabled).toBe(false);
    });

    it('parses a comma-separated product id string', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const section = await HomeSectionModel.create({
        title: 'Section',
        // @ts-expect-error testing defensive parsing of a string list
        productIds: ' p-1 ,p-2 ',
      });

      expect(section.productIds).toEqual(['p-1', 'p-2']);
    });

    it('coerces invalid numeric input instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const section = await HomeSectionModel.create({
        title: 'Bad',
        // @ts-expect-error testing defensive coercion against garbage input
        sortOrder: 'abc',
      });

      expect(section.sortOrder).toBe(0);
    });
  });

  describe('findById()', () => {
    it('returns the matching section', async () => {
      const found = { _id: 'h1', title: 'Section' };
      mockCollection.findOne.mockResolvedValue(found);

      const section = await HomeSectionModel.findById('h1');
      expect(section).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'h1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const section = await HomeSectionModel.findById('missing');
      expect(section).toBeNull();
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

    it('returns sections and total count', async () => {
      const sections = [{ _id: 'h1' }, { _id: 'h2' }];
      const { sortMock } = chain(sections);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await HomeSectionModel.findPaginated(1, 10);
      expect(result.sections).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty list gracefully (Edge case)', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await HomeSectionModel.findPaginated(5, 20);
      expect(result.sections).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies a title regex filter and a sectionType filter', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await HomeSectionModel.findPaginated(1, 10, { search: 'featured', sectionType: 'promo-banner' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([{ title: { $regex: 'featured', $options: 'i' } }]);
      expect(filter.sectionType).toBe('promo-banner');
    });

    it('converts the enabled string filter into a boolean', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await HomeSectionModel.findPaginated(1, 10, { enabled: 'true' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.enabled).toBe(true);
    });
  });

  describe('update()', () => {
    it('updates a section and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await HomeSectionModel.update('h1', { title: 'Updated' });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'h1' },
        expect.objectContaining({ $set: expect.objectContaining({ title: 'Updated' }) })
      );
    });

    it('returns false when the section does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await HomeSectionModel.update('missing', { title: 'X' });
      expect(success).toBe(false);
    });

    it('normalizes product ids when updating', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await HomeSectionModel.update('h1', { productIds: 'x, y,' as unknown as string[] });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.productIds).toEqual(['x', 'y']);
      expect($set.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete()', () => {
    it('deletes a section and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await HomeSectionModel.delete('h1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'h1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await HomeSectionModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('count()', () => {
    it('returns the total section count', async () => {
      mockCollection.countDocuments.mockResolvedValue(4);

      const count = await HomeSectionModel.count();
      expect(count).toBe(4);
    });

    it('returns the enabled section count', async () => {
      mockCollection.countDocuments.mockResolvedValue(2);

      const count = await HomeSectionModel.countEnabled();
      expect(count).toBe(2);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ enabled: true });
    });
  });
});
