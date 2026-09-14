import { TestimonialModel } from '@/models/testimonial.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('TestimonialModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a testimonial with full schema and default values', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const item = await TestimonialModel.create({
        name: '  Emma Williams  ',
        role: '  Fashion Stylist  ',
        quote: '  Everything is absolutely perfect!  ',
        avatar: '  https://img.com/avatar.png  ',
        rating: 5,
        reviewCount: 49,
        isFeatured: true,
        status: 'active',
      });

      expect(item._id).toBeDefined();
      expect(item.name).toBe('Emma Williams');
      expect(item.role).toBe('Fashion Stylist');
      expect(item.quote).toBe('Everything is absolutely perfect!');
      expect(item.avatar).toBe('https://img.com/avatar.png');
      expect(item.rating).toBe(5);
      expect(item.reviewCount).toBe(49);
      expect(item.isFeatured).toBe(true);
      expect(item.status).toBe('active');
    });

    it('clamps rating between 1 and 5', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const itemOver = await TestimonialModel.create({
        name: 'John',
        role: 'Dev',
        quote: 'Great',
        rating: 10,
      });

      const itemUnder = await TestimonialModel.create({
        name: 'John',
        role: 'Dev',
        quote: 'Great',
        rating: -5,
      });

      expect(itemOver.rating).toBe(5);
      expect(itemUnder.rating).toBe(1);
    });
  });

  describe('findById()', () => {
    it('returns testimonial when found', async () => {
      const mockDoc = { _id: 't1', name: 'Emma Williams' };
      mockCollection.findOne.mockResolvedValue(mockDoc);

      const res = await TestimonialModel.findById('t1');
      expect(res).toEqual(mockDoc);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 't1' });
    });

    it('returns null when not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      const res = await TestimonialModel.findById('nonexistent');
      expect(res).toBeNull();
    });
  });

  describe('findAllActive()', () => {
    it('queries active status and sorts by isFeatured and createdAt', async () => {
      const mockArray = [{ _id: 't1' }];
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockArray),
      };
      mockCollection.find.mockReturnValue(mockChain);

      const res = await TestimonialModel.findAllActive();
      expect(res).toEqual(mockArray);
      expect(mockCollection.find).toHaveBeenCalledWith({ status: 'active' });
      expect(mockChain.sort).toHaveBeenCalledWith({ isFeatured: -1, createdAt: -1 });
    });
  });

  describe('findPaginated()', () => {
    it('applies search, status, and isFeatured filters correctly', async () => {
      const mockArray = [{ _id: 't1' }];
      const mockChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue(mockArray),
      };
      mockCollection.find.mockReturnValue(mockChain);
      mockCollection.countDocuments.mockResolvedValue(1);

      const res = await TestimonialModel.findPaginated(1, 10, {
        search: 'Emma',
        status: 'active',
        isFeatured: true,
      });

      expect(res).toEqual({ testimonials: mockArray, total: 1 });
      expect(mockCollection.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Emma', $options: 'i' } },
          { role: { $regex: 'Emma', $options: 'i' } },
          { quote: { $regex: 'Emma', $options: 'i' } },
        ],
        status: 'active',
        isFeatured: true,
      });
    });
  });

  describe('update()', () => {
    it('updates fields correctly and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const res = await TestimonialModel.update('t1', {
        name: '  Emma W.  ',
        rating: 4.5,
      });

      expect(res).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 't1' },
        {
          $set: expect.objectContaining({
            name: 'Emma W.',
            rating: 4.5,
          }),
        }
      );
    });

    it('returns false when document to update is not found', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });
      const res = await TestimonialModel.update('t999', { name: 'Test' });
      expect(res).toBe(false);
    });
  });

  describe('delete()', () => {
    it('returns true on successful deletion', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
      const res = await TestimonialModel.delete('t1');
      expect(res).toBe(true);
    });

    it('returns false when document to delete is not found', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });
      const res = await TestimonialModel.delete('t999');
      expect(res).toBe(false);
    });
  });
});
