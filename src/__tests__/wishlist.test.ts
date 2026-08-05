import { UserModel } from '@/models/user.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

jest.mock('mongodb', () => {
  class MockObjectId {
    value: string;
    constructor(value?: string) {
      this.value = value || 'mock-object-id';
    }
    toHexString() {
      return this.value;
    }
    static isValid() {
      return false;
    }
  }
  return {
    Collection: class {},
    ObjectId: MockObjectId,
  };
});

describe('UserModel Wishlist Unit Tests (Possible & Impossible Edge Cases)', () => {
  const mockCollection = {
    insertOne: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getDb as jest.Mock).mockResolvedValue({
      collection: () => mockCollection,
    });
  });

  describe('create()', () => {
    it('creates a user with default role, status, addresses and wishlist', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const user = await UserModel.create({
        name: 'Alice',
        email: 'alice@test.com',
        password: 'hashed',
      });

      expect(user._id).toBeDefined();
      expect(user.role).toBe('user');
      expect(user.status).toBe('active');
      expect(user.addresses).toEqual([]);
      expect(user.wishlist).toEqual([]);
      expect(user.phone).toBeUndefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('stores a phone number when provided', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const user = await UserModel.create({
        name: 'Alice',
        email: 'alice@test.com',
        password: 'hashed',
        phone: '+1-555-0100',
      });

      expect(user.phone).toBe('+1-555-0100');
    });
  });

  describe('getWishlist()', () => {
    it('returns the wishlist array from the user document', async () => {
      const wishlist = [
        { product: 'p1', addedAt: new Date() },
        { product: 'p2', addedAt: new Date() },
      ];
      mockCollection.findOne.mockResolvedValue({ wishlist });

      const result = await UserModel.getWishlist('u1');
      expect(result).toEqual(wishlist);
      expect(mockCollection.findOne).toHaveBeenCalledWith(
        expect.anything(),
        { projection: { wishlist: 1 } }
      );
    });

    it('returns an empty array when the user has no wishlist field (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue({ name: 'Alice' });

      const result = await UserModel.getWishlist('u1');
      expect(result).toEqual([]);
    });

    it('returns an empty array when the user is not found (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await UserModel.getWishlist('missing');
      expect(result).toEqual([]);
    });

    it('returns an empty array when the wishlist field is malformed (Impossible edge case)', async () => {
      mockCollection.findOne.mockResolvedValue({ wishlist: 'not-an-array' });

      const result = await UserModel.getWishlist('u1');
      expect(result).toEqual([]);
    });
  });

  describe('isInWishlist()', () => {
    it('returns true when the product is in the wishlist', async () => {
      mockCollection.findOne.mockResolvedValue({ _id: 'u1' });

      const result = await UserModel.isInWishlist('u1', 'p1');
      expect(result).toBe(true);
    });

    it('returns false when the product is not in the wishlist (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await UserModel.isInWishlist('u1', 'p1');
      expect(result).toBe(false);
    });
  });

  describe('addToWishlist()', () => {
    it('adds a product with a timestamp and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await UserModel.addToWishlist('u1', 'p1');
      expect(success).toBe(true);

      const [query, update] = mockCollection.updateOne.mock.calls[0];
      expect(update).toEqual(
        expect.objectContaining({
          $addToSet: expect.objectContaining({
            wishlist: expect.objectContaining({
              product: 'p1',
              addedAt: expect.any(Date),
            }),
          }),
        })
      );
      expect(query).toBeDefined();
    });

    it('uses $addToSet so duplicate products are never stored twice (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await UserModel.addToWishlist('u1', 'p1');
      expect(success).toBe(false);
    });

    it('returns false when the user does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await UserModel.addToWishlist('missing', 'p1');
      expect(success).toBe(false);
    });
  });

  describe('removeFromWishlist()', () => {
    it('removes a product and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await UserModel.removeFromWishlist('u1', 'p1');
      expect(success).toBe(true);

      const [query, update] = mockCollection.updateOne.mock.calls[0];
      expect(update).toEqual({
        $pull: { wishlist: { product: 'p1' } },
      });
      expect(query).toBeDefined();
    });

    it('returns false when the product was not in the wishlist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await UserModel.removeFromWishlist('u1', 'p1');
      expect(success).toBe(false);
    });
  });

  describe('clearWishlist()', () => {
    it('clears the entire wishlist and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await UserModel.clearWishlist('u1');
      expect(success).toBe(true);

      const [query, update] = mockCollection.updateOne.mock.calls[0];
      expect(update).toEqual({ $set: { wishlist: [] } });
      expect(query).toBeDefined();
    });

    it('returns false when the user does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await UserModel.clearWishlist('missing');
      expect(success).toBe(false);
    });
  });

  describe('countWishlist()', () => {
    it('returns the number of wishlist items', async () => {
      mockCollection.findOne.mockResolvedValue({
        wishlist: [{ product: 'p1' }, { product: 'p2' }, { product: 'p3' }],
      });

      const count = await UserModel.countWishlist('u1');
      expect(count).toBe(3);
    });

    it('returns 0 when the wishlist is empty (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue({ wishlist: [] });

      const count = await UserModel.countWishlist('u1');
      expect(count).toBe(0);
    });

    it('returns 0 when the user is not found (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const count = await UserModel.countWishlist('missing');
      expect(count).toBe(0);
    });
  });

  describe('normalizeUser defaults (create returns sane wishlist shape)', () => {
    it('normalizes a raw user with string ObjectId into a wishlist-aware shape', async () => {
      mockCollection.findOne.mockResolvedValue({
        _id: 'u1',
        email: 'a@b.com',
        password: 'x',
        name: 'Alice',
        role: 'admin',
      });

      const user = await UserModel.findById('u1');
      expect(user).not.toBeNull();
      expect(user!.status).toBe('active');
      expect(user!.addresses).toEqual([]);
      expect(user!.wishlist).toEqual([]);
    });
  });
});
