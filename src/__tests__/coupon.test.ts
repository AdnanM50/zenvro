import { CouponModel } from '@/models/coupon.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('CouponModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a coupon with the full schema and a normalized code', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const coupon = await CouponModel.create({
        name: 'Summer Sale',
        code: 'summer10',
        type: 'fixed',
        value: 10,
        minOrderAmount: 50,
        maxDiscountAmount: 25,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        usageLimit: 100,
        perUserLimit: 1,
        appliesTo: 'products',
        products: ['p-1', 'p-2'],
        categories: [],
        status: 'active',
      });

      expect(coupon._id).toBeDefined();
      expect(coupon.name).toBe('Summer Sale');
      expect(coupon.code).toBe('SUMMER10');
      expect(coupon.type).toBe('fixed');
      expect(coupon.value).toBe(10);
      expect(coupon.minOrderAmount).toBe(50);
      expect(coupon.maxDiscountAmount).toBe(25);
      expect(coupon.startDate).toBe('2025-01-01');
      expect(coupon.endDate).toBe('2025-12-31');
      expect(coupon.usageLimit).toBe(100);
      expect(coupon.perUserLimit).toBe(1);
      expect(coupon.usedCount).toBe(0);
      expect(coupon.appliesTo).toBe('products');
      expect(coupon.products).toEqual(['p-1', 'p-2']);
      expect(coupon.categories).toEqual([]);
      expect(coupon.status).toBe('active');
      expect(coupon.createdAt).toBeInstanceOf(Date);
      expect(coupon.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a coupon with a minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const coupon = await CouponModel.create({
        name: 'Minimal',
        code: 'MIN1',
        value: 15,
      });

      expect(coupon.type).toBe('percentage');
      expect(coupon.status).toBe('active');
      expect(coupon.appliesTo).toBe('all');
      expect(coupon.products).toEqual([]);
      expect(coupon.categories).toEqual([]);
      expect(coupon.usedCount).toBe(0);
      expect(coupon.minOrderAmount).toBeUndefined();
      expect(coupon.usageLimit).toBeUndefined();
    });

    it('normalizes codes with mixed case, whitespace and padding', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const coupon = await CouponModel.create({
        name: 'Spaced',
        code: '  save  10  ',
        value: 10,
      });

      expect(coupon.code).toBe('SAVE10');
    });

    it('coerces invalid numeric input instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const coupon = await CouponModel.create({
        name: 'Bad Numbers',
        code: 'BAD1',
        // @ts-expect-error testing defensive coercion against garbage input
        value: 'abc',
      });

      expect(coupon.value).toBe(0);
    });
  });

  describe('findById()', () => {
    it('returns the matching coupon', async () => {
      const found = { _id: 'c1', name: 'Tee', code: 'SAVE10' };
      mockCollection.findOne.mockResolvedValue(found);

      const coupon = await CouponModel.findById('c1');
      expect(coupon).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'c1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const coupon = await CouponModel.findById('missing');
      expect(coupon).toBeNull();
    });
  });

  describe('findByCode()', () => {
    it('returns the matching coupon by a normalized code', async () => {
      const found = { _id: 'c1', code: 'SAVE10' };
      mockCollection.findOne.mockResolvedValue(found);

      const coupon = await CouponModel.findByCode('save10');
      expect(coupon).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ code: 'SAVE10' });
    });

    it('returns null when the code does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const coupon = await CouponModel.findByCode('DOES-NOT-EXIST');
      expect(coupon).toBeNull();
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

    it('returns coupons and total count', async () => {
      const coupons = [
        { _id: 'c1', name: 'Summer', code: 'SUMMER10', value: 10 },
        { _id: 'c2', name: 'Winter', code: 'WINTER15', value: 15 },
      ];
      const { sortMock } = chain(coupons);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await CouponModel.findPaginated(1, 10);
      expect(result.coupons).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty coupon list gracefully (Edge case)', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await CouponModel.findPaginated(5, 20);
      expect(result.coupons).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies a name/code regex filter when a search term is provided', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await CouponModel.findPaginated(1, 10, { search: 'summer' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([
        { name: { $regex: 'summer', $options: 'i' } },
        { code: { $regex: 'summer', $options: 'i' } },
      ]);
    });

    it('applies type and status filters', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await CouponModel.findPaginated(1, 10, { type: 'fixed', status: 'active' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter).toEqual({ type: 'fixed', status: 'active' });
    });
  });

  describe('update()', () => {
    it('updates a coupon and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await CouponModel.update('c1', { value: 20 });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'c1' },
        expect.objectContaining({ $set: expect.objectContaining({ value: 20 }) })
      );
    });

    it('returns false when the coupon does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await CouponModel.update('missing', { value: 20 });
      expect(success).toBe(false);
    });

    it('normalizes a new code when updating', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await CouponModel.update('c1', { code: 'new  code ' });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.code).toBe('NEWCODE');
      expect($set.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete()', () => {
    it('deletes a coupon and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await CouponModel.delete('c1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'c1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await CouponModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('findAll()', () => {
    it('returns every coupon sorted by newest first', async () => {
      const coupons = [{ _id: 'c1' }, { _id: 'c2' }];
      const toArrayMock = jest.fn().mockResolvedValue(coupons);
      const sortMock = jest.fn().mockReturnValue({ toArray: toArrayMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });

      const result = await CouponModel.findAll();
      expect(result).toEqual(coupons);
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
