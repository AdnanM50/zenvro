import { InventoryModel } from '@/models/inventory.model';
import { ProductModel } from '@/models/product.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');
jest.mock('@/models/product.model');

describe('InventoryModel Unit Tests (All Edge Cases)', () => {
  const mockCollection = {
    insertOne: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => mockCollection,
    });
  });

  describe('create()', () => {
    it('creates an inventory record and updates product stock for "in" movement', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });
      (ProductModel.findById as jest.Mock).mockResolvedValue({
        _id: 'prod-123',
        stock: 50,
        variants: [],
      });
      (ProductModel.update as jest.Mock).mockResolvedValue(true);

      const item = await InventoryModel.create({
        productId: 'prod-123',
        quantity: 20,
        movementType: 'in',
        note: 'Restock shipment',
      });

      expect(item._id).toBeDefined();
      expect(item.productId).toBe('prod-123');
      expect(item.quantity).toBe(20);
      expect(item.movementType).toBe('in');
      expect(item.note).toBe('Restock shipment');
      expect(mockCollection.insertOne).toHaveBeenCalledTimes(1);

      expect(ProductModel.findById).toHaveBeenCalledWith('prod-123');
      expect(ProductModel.update).toHaveBeenCalledWith('prod-123', { stock: 70 });
    });

    it('handles stock reduction for "out" movement and prevents negative stock', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });
      (ProductModel.findById as jest.Mock).mockResolvedValue({
        _id: 'prod-123',
        stock: 10,
        variants: [],
      });
      (ProductModel.update as jest.Mock).mockResolvedValue(true);

      const item = await InventoryModel.create({
        productId: 'prod-123',
        quantity: 25,
        movementType: 'out',
        note: 'Order fulfillment',
      });

      expect(item.quantity).toBe(25);
      expect(ProductModel.update).toHaveBeenCalledWith('prod-123', { stock: 0 });
    });

    it('handles variant specific stock adjustment correctly', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });
      (ProductModel.findById as jest.Mock).mockResolvedValue({
        _id: 'prod-123',
        stock: 40,
        variants: [
          { sku: 'VAR-RED', stock: 15 },
          { sku: 'VAR-BLUE', stock: 25 },
        ],
      });
      (ProductModel.update as jest.Mock).mockResolvedValue(true);

      const item = await InventoryModel.create({
        productId: 'prod-123',
        variantSku: 'VAR-RED',
        quantity: 10,
        movementType: 'in',
        note: 'Variant restock',
      });

      expect(item.variantSku).toBe('VAR-RED');
      expect(ProductModel.update).toHaveBeenCalledWith('prod-123', {
        variants: [
          { sku: 'VAR-RED', stock: 25 },
          { sku: 'VAR-BLUE', stock: 25 },
        ],
        stock: 50,
      });
    });

    it('coerces invalid/non-numeric quantity to fallback 0', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });
      (ProductModel.findById as jest.Mock).mockResolvedValue(null);

      const item = await InventoryModel.create({
        productId: 'prod-999',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quantity: 'invalid' as any,
        movementType: 'adjustment',
      });

      expect(item.quantity).toBe(0);
      expect(ProductModel.update).not.toHaveBeenCalled();
    });
  });

  describe('findById()', () => {
    it('returns inventory item when found', async () => {
      const mockItem = { _id: 'inv-1', productId: 'prod-1', quantity: 10, movementType: 'in' };
      mockCollection.findOne.mockResolvedValue(mockItem);

      const result = await InventoryModel.findById('inv-1');
      expect(result).toEqual(mockItem);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'inv-1' });
    });

    it('returns null when item not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await InventoryModel.findById('inv-999');
      expect(result).toBeNull();
    });
  });

  describe('findPaginated()', () => {
    it('returns paginated items with filters applied', async () => {
      const mockItems = [{ _id: 'inv-1' }, { _id: 'inv-2' }];
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockItems),
      };
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await InventoryModel.findPaginated(1, 10, {
        productId: 'prod-1',
        movementType: 'in',
      });

      expect(result).toEqual({ items: mockItems, total: 2 });
      expect(mockCollection.find).toHaveBeenCalledWith({ productId: 'prod-1', movementType: 'in' });
    });
  });

  describe('delete()', () => {
    it('returns true when deletion succeeds', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const result = await InventoryModel.delete('inv-1');
      expect(result).toBe(true);
    });

    it('returns false when document to delete is not found', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const result = await InventoryModel.delete('inv-999');
      expect(result).toBe(false);
    });
  });
});
