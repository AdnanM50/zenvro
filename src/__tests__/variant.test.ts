import { VariantModel } from '@/models/variant.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('VariantModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a variant with full payload (sku, attributes, pricing, stock, image, weight)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const variant = await VariantModel.create({
        sku: 'TSH-BLK-XL',
        attributes: { Color: 'Black', Size: 'XL' },
        price: 49.99,
        salePrice: 39.99,
        stock: 25,
        image: 'https://example.com/black-xl.png',
        weight: 0.4,
      });

      expect(variant._id).toBeDefined();
      expect(variant.sku).toBe('TSH-BLK-XL');
      expect(variant.attributes).toEqual({ Color: 'Black', Size: 'XL' });
      expect(variant.price).toBe(49.99);
      expect(variant.salePrice).toBe(39.99);
      expect(variant.stock).toBe(25);
      expect(variant.image).toBe('https://example.com/black-xl.png');
      expect(variant.weight).toBe(0.4);
    });

    it('creates a variant with minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const variant = await VariantModel.create({
        sku: 'MIN-1',
        price: 10,
        stock: 0,
      });

      expect(variant.attributes).toEqual({});
      expect(variant.salePrice).toBeUndefined();
      expect(variant.image).toBe('');
      expect(variant.weight).toBeUndefined();
      expect(variant.createdAt).toBeInstanceOf(Date);
      expect(variant.updatedAt).toBeInstanceOf(Date);
    });

    it('coerces invalid numeric input to 0 instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const variant = await VariantModel.create({
        sku: 'BAD-NUM',
        // @ts-expect-error testing defensive coercion against garbage input
        price: 'abc',
        // @ts-expect-error testing defensive coercion against garbage input
        stock: null,
      });

      expect(variant.price).toBe(0);
      expect(variant.stock).toBe(0);
    });
  });

  describe('findById()', () => {
    it('returns the matching variant', async () => {
      const found = { _id: 'v1', sku: 'TSH-BLK-XL' };
      mockCollection.findOne.mockResolvedValue(found);

      const variant = await VariantModel.findById('v1');
      expect(variant).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'v1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const variant = await VariantModel.findById('missing');
      expect(variant).toBeNull();
    });
  });

  describe('findBySku()', () => {
    it('returns the matching variant by sku', async () => {
      const found = { _id: 'v2', sku: 'TSH-BLK-XL' };
      mockCollection.findOne.mockResolvedValue(found);

      const variant = await VariantModel.findBySku('TSH-BLK-XL');
      expect(variant).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ sku: 'TSH-BLK-XL' });
    });

    it('returns null when the sku does not exist', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const variant = await VariantModel.findBySku('DOES-NOT-EXIST');
      expect(variant).toBeNull();
    });
  });

  describe('findPaginated()', () => {
    it('returns variants and total count', async () => {
      const variants = [
        { _id: 'v1', sku: 'TSH-BLK-XL', price: 49.99, stock: 25 },
        { _id: 'v2', sku: 'TSH-RED-XL', price: 49.99, stock: 0 },
      ];
      const toArrayMock = jest.fn().mockResolvedValue(variants);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await VariantModel.findPaginated(1, 10);
      expect(result.variants).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty variant list gracefully (Edge case)', async () => {
      const toArrayMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await VariantModel.findPaginated(5, 20);
      expect(result.variants).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies an sku/image regex filter when a search term is provided', async () => {
      const toArrayMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ toArray: toArrayMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await VariantModel.findPaginated(1, 10, 'tsh');

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([
        { sku: { $regex: 'tsh', $options: 'i' } },
        { image: { $regex: 'tsh', $options: 'i' } },
      ]);
    });
  });

  describe('update()', () => {
    it('updates a variant and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await VariantModel.update('v1', { price: 59.99, stock: 10 });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'v1' },
        expect.objectContaining({ $set: expect.objectContaining({ price: 59.99, stock: 10 }) })
      );
    });

    it('returns false when the variant does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await VariantModel.update('missing', { price: 1 });
      expect(success).toBe(false);
    });

    it('stores the attributes map on update', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await VariantModel.update('v1', { attributes: { Size: 'M' } });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.attributes).toEqual({ Size: 'M' });
      expect($set.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('delete()', () => {
    it('deletes a variant and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await VariantModel.delete('v1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'v1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await VariantModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('findAll()', () => {
    it('returns every variant sorted by newest first', async () => {
      const variants = [{ _id: 'v1' }, { _id: 'v2' }];
      const toArrayMock = jest.fn().mockResolvedValue(variants);
      const sortMock = jest.fn().mockReturnValue({ toArray: toArrayMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });

      const result = await VariantModel.findAll();
      expect(result).toEqual(variants);
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });
});
