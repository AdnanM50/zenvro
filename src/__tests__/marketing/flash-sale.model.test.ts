import { FlashSaleModel } from '@/models/flash-sale.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('FlashSaleModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a sale with the full schema', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const sale = await FlashSaleModel.create({
        title: 'Mega Sale',
        description: 'Limited time',
        discountType: 'fixed',
        discountValue: 10,
        startsAt: '2025-01-01T00:00',
        endsAt: '2025-01-02T00:00',
        productIds: ['p-1', 'p-2'],
        showOnHome: true,
        sortOrder: 1,
        status: 'active',
      });

      expect(sale._id).toBeDefined();
      expect(sale.title).toBe('Mega Sale');
      expect(sale.description).toBe('Limited time');
      expect(sale.discountType).toBe('fixed');
      expect(sale.discountValue).toBe(10);
      expect(sale.startsAt).toBe('2025-01-01T00:00');
      expect(sale.endsAt).toBe('2025-01-02T00:00');
      expect(sale.productIds).toEqual(['p-1', 'p-2']);
      expect(sale.showOnHome).toBe(true);
      expect(sale.sortOrder).toBe(1);
      expect(sale.status).toBe('active');
      expect(sale.createdAt).toBeInstanceOf(Date);
      expect(sale.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a sale with a minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const sale = await FlashSaleModel.create({
        title: 'Minimal',
        discountValue: 15,
        startsAt: '2025-01-01T00:00',
        endsAt: '2025-01-02T00:00',
      });

      expect(sale.discountType).toBe('percentage');
      expect(sale.description).toBeUndefined();
      expect(sale.productIds).toEqual([]);
      expect(sale.showOnHome).toBe(false);
      expect(sale.sortOrder).toBe(0);
      expect(sale.status).toBe('inactive');
    });

    it('parses a comma-separated product id string', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const sale = await FlashSaleModel.create({
        title: 'Sale',
        discountValue: 10,
        startsAt: '2025-01-01T00:00',
        endsAt: '2025-01-02T00:00',
        // @ts-expect-error testing defensive parsing of a string list
        productIds: ' p-1 , p-2,  p-3 ',
      });

      expect(sale.productIds).toEqual(['p-1', 'p-2', 'p-3']);
    });

    it('coerces invalid numeric input instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const sale = await FlashSaleModel.create({
        title: 'Bad',
        // @ts-expect-error testing defensive coercion against garbage input
        discountValue: 'abc',
        startsAt: '2025-01-01T00:00',
        endsAt: '2025-01-02T00:00',
      });

      expect(sale.discountValue).toBe(0);
    });
  });

  describe('findById()', () => {
    it('returns the matching sale', async () => {
      const found = { _id: 's1', title: 'Sale' };
      mockCollection.findOne.mockResolvedValue(found);

      const sale = await FlashSaleModel.findById('s1');
      expect(sale).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 's1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const sale = await FlashSaleModel.findById('missing');
      expect(sale).toBeNull();
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

    it('returns sales and total count', async () => {
      const sales = [{ _id: 's1' }, { _id: 's2' }];
      const { sortMock } = chain(sales);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await FlashSaleModel.findPaginated(1, 10);
      expect(result.sales).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty list gracefully (Edge case)', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await FlashSaleModel.findPaginated(5, 20);
      expect(result.sales).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies a title regex filter and a status filter', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await FlashSaleModel.findPaginated(1, 10, { search: 'sale', status: 'active' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([{ title: { $regex: 'sale', $options: 'i' } }]);
      expect(filter.status).toBe('active');
    });
  });

  describe('update()', () => {
    it('updates a sale and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await FlashSaleModel.update('s1', { title: 'Updated' });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 's1' },
        expect.objectContaining({ $set: expect.objectContaining({ title: 'Updated' }) })
      );
    });

    it('returns false when the sale does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await FlashSaleModel.update('missing', { title: 'X' });
      expect(success).toBe(false);
    });

    it('normalizes product ids when updating', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await FlashSaleModel.update('s1', { productIds: ' a , b ,' as unknown as string[] });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.productIds).toEqual(['a', 'b']);
      expect($set.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete()', () => {
    it('deletes a sale and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await FlashSaleModel.delete('s1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 's1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await FlashSaleModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('count()', () => {
    it('returns the total sale count', async () => {
      mockCollection.countDocuments.mockResolvedValue(3);

      const count = await FlashSaleModel.count();
      expect(count).toBe(3);
    });

    it('returns the active sale count', async () => {
      mockCollection.countDocuments.mockResolvedValue(1);

      const count = await FlashSaleModel.countActive();
      expect(count).toBe(1);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'active' });
    });
  });
});
