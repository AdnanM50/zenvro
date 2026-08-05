import { ReviewModel } from '@/models/review.model';
import { getDb } from '@/lib/db';

jest.mock('@/lib/db');

describe('ReviewModel Unit Tests (Possible & Impossible Edge Cases)', () => {
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
    it('creates a review with the full schema', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const review = await ReviewModel.create({
        product: 'p1',
        user: 'u1',
        rating: 5,
        title: 'Amazing',
        comment: 'Love this product',
        images: ['https://img.com/a.png', 'https://img.com/b.png'],
      });

      expect(review._id).toBeDefined();
      expect(review.product).toBe('p1');
      expect(review.user).toBe('u1');
      expect(review.rating).toBe(5);
      expect(review.title).toBe('Amazing');
      expect(review.comment).toBe('Love this product');
      expect(review.images).toEqual(['https://img.com/a.png', 'https://img.com/b.png']);
      expect(review.isVerifiedPurchase).toBe(false);
      expect(review.isApproved).toBe(false);
      expect(review.status).toBe('pending');
      expect(review.createdAt).toBeInstanceOf(Date);
    });

    it('creates a review with a minimal payload and sane defaults', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const review = await ReviewModel.create({ product: 'p1', rating: 3 });

      expect(review.title).toBe('');
      expect(review.comment).toBe('');
      expect(review.images).toEqual([]);
      expect(review.isVerifiedPurchase).toBe(false);
      expect(review.isApproved).toBe(false);
      expect(review.status).toBe('pending');
    });

    it('trims title and comment whitespace (Edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const review = await ReviewModel.create({
        product: 'p1',
        rating: 4,
        title: '  Great  ',
        comment: '  Works fine  ',
      });

      expect(review.title).toBe('Great');
      expect(review.comment).toBe('Works fine');
    });

    it('coerces out-of-range ratings into the 1..5 range instead of crashing (Impossible edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const high = await ReviewModel.create({
        product: 'p1',
        // @ts-expect-error testing defensive coercion against garbage input
        rating: 99,
      });
      const low = await ReviewModel.create({
        product: 'p1',
        // @ts-expect-error testing defensive coercion against garbage input
        rating: -3,
      });
      const nonNumeric = await ReviewModel.create({
        product: 'p1',
        // @ts-expect-error testing defensive coercion against garbage input
        rating: 'abc',
      });

      expect(high.rating).toBe(5);
      expect(low.rating).toBe(5);
      expect(nonNumeric.rating).toBe(5);
    });

    it('rounds decimal ratings to the nearest integer (Edge case)', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: true });

      const review = await ReviewModel.create({
        product: 'p1',
        // @ts-expect-error testing decimal coercion
        rating: 4.5,
      });

      expect(review.rating).toBe(5);
    });
  });

  describe('findById()', () => {
    it('returns the matching review', async () => {
      const found = { _id: 'r1', product: 'p1', rating: 5 };
      mockCollection.findOne.mockResolvedValue(found);

      const review = await ReviewModel.findById('r1');
      expect(review).toEqual(found);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: 'r1' });
    });

    it('returns null for a non-existent id (Edge case)', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const review = await ReviewModel.findById('missing');
      expect(review).toBeNull();
    });
  });

  describe('findApprovedByProduct()', () => {
    it('only returns approved reviews for a product', async () => {
      const reviews = [{ _id: 'r1' }, { _id: 'r2' }];
      const toArrayMock = jest.fn().mockResolvedValue(reviews);
      const sortMock = jest.fn().mockReturnValue({ toArray: toArrayMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });

      const result = await ReviewModel.findApprovedByProduct('p1');

      expect(result).toEqual(reviews);
      expect(mockCollection.find).toHaveBeenCalledWith({
        product: 'p1',
        status: 'approved',
        isApproved: true,
      });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('returns an empty array when there are no approved reviews (Edge case)', async () => {
      const toArrayMock = jest.fn().mockResolvedValue([]);
      const sortMock = jest.fn().mockReturnValue({ toArray: toArrayMock });

      mockCollection.find.mockReturnValue({ sort: sortMock });

      const result = await ReviewModel.findApprovedByProduct('p1');
      expect(result).toEqual([]);
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

    it('returns reviews and total count', async () => {
      const reviews = [{ _id: 'r1', rating: 5 }, { _id: 'r2', rating: 4 }];
      const { sortMock } = chain(reviews);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(2);

      const result = await ReviewModel.findPaginated(1, 10);
      expect(result.reviews).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('handles an empty review list gracefully (Edge case)', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await ReviewModel.findPaginated(5, 20);
      expect(result.reviews).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('applies a title/comment regex filter when a search term is provided', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await ReviewModel.findPaginated(1, 10, { search: 'great' });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter.$or).toEqual([
        { title: { $regex: 'great', $options: 'i' } },
        { comment: { $regex: 'great', $options: 'i' } },
      ]);
    });

    it('applies status, product, rating and boolean filters', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await ReviewModel.findPaginated(1, 10, {
        status: 'approved',
        product: 'p1',
        rating: 5,
        isApproved: true,
        isVerifiedPurchase: false,
      });

      const filter = mockCollection.find.mock.calls[0][0];
      expect(filter).toEqual({
        status: 'approved',
        product: 'p1',
        rating: 5,
        isApproved: true,
        isVerifiedPurchase: false,
      });
    });

    it('builds an empty filter object when no params are passed', async () => {
      const { sortMock } = chain([]);
      mockCollection.find.mockReturnValue({ sort: sortMock });
      mockCollection.countDocuments.mockResolvedValue(0);

      await ReviewModel.findPaginated(1, 10, {});

      expect(mockCollection.find.mock.calls[0][0]).toEqual({});
    });
  });

  describe('update()', () => {
    it('updates a review and returns true', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await ReviewModel.update('r1', { comment: 'Updated' });
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'r1' },
        expect.objectContaining({ $set: expect.objectContaining({ comment: 'Updated' }) })
      );
    });

    it('returns false when the review does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await ReviewModel.update('missing', { comment: 'Updated' });
      expect(success).toBe(false);
    });

    it('normalizes a new rating to the 1..5 range when updating (Impossible edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await ReviewModel.update('r1', {
        // @ts-expect-error testing defensive coercion against garbage input
        rating: 12,
      });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.rating).toBe(5);
    });

    it('resets images to an empty array when an empty list is passed', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await ReviewModel.update('r1', { images: [] });

      const { $set } = mockCollection.updateOne.mock.calls[0][1];
      expect($set.images).toEqual([]);
    });
  });

  describe('updateApproval()', () => {
    it('approves a review by setting status and isApproved', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await ReviewModel.updateApproval('r1', 'approved');
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'r1' },
        { $set: { status: 'approved', isApproved: true } }
      );
    });

    it('rejects a review by setting status and clearing isApproved', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await ReviewModel.updateApproval('r1', 'rejected');
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'r1' },
        { $set: { status: 'rejected', isApproved: false } }
      );
    });

    it('returns a review to pending status', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const success = await ReviewModel.updateApproval('r1', 'pending');
      expect(success).toBe(true);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: 'r1' },
        { $set: { status: 'pending', isApproved: false } }
      );
    });

    it('returns false for an invalid status (Impossible edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // @ts-expect-error testing defensive handling of invalid status
      const success = await ReviewModel.updateApproval('r1', 'bogus');
      expect(success).toBe(false);
      expect(mockCollection.updateOne).not.toHaveBeenCalled();
    });

    it('returns false when the review does not exist (Edge case)', async () => {
      mockCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const success = await ReviewModel.updateApproval('missing', 'approved');
      expect(success).toBe(false);
    });
  });

  describe('delete()', () => {
    it('deletes a review and returns true', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const success = await ReviewModel.delete('r1');
      expect(success).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({ _id: 'r1' });
    });

    it('returns false when nothing was deleted (Edge case)', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      const success = await ReviewModel.delete('missing');
      expect(success).toBe(false);
    });
  });

  describe('count()', () => {
    it('counts all reviews when no filters are passed', async () => {
      mockCollection.countDocuments.mockResolvedValue(7);

      const count = await ReviewModel.count();
      expect(count).toBe(7);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({});
    });

    it('counts reviews matching a filter', async () => {
      mockCollection.countDocuments.mockResolvedValue(3);

      const count = await ReviewModel.count({ status: 'pending' });
      expect(count).toBe(3);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'pending' });
    });

    it('returns 0 when there are no reviews (Edge case)', async () => {
      mockCollection.countDocuments.mockResolvedValue(0);

      const count = await ReviewModel.count();
      expect(count).toBe(0);
    });
  });

  describe('getProductRatingSummary()', () => {
    it('computes the average rating and per-star counts', async () => {
      const reviews = [
        { _id: 'r1', rating: 5, status: 'approved', isApproved: true },
        { _id: 'r2', rating: 5, status: 'approved', isApproved: true },
        { _id: 'r3', rating: 4, status: 'approved', isApproved: true },
      ];
      const toArrayMock = jest.fn().mockResolvedValue(reviews);

      mockCollection.find.mockReturnValue({ toArray: toArrayMock });

      const summary = await ReviewModel.getProductRatingSummary('p1');

      expect(summary.product).toBe('p1');
      expect(summary.totalReviews).toBe(3);
      expect(summary.averageRating).toBe(4.7);
      expect(summary.ratingCounts).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 });
      expect(mockCollection.find).toHaveBeenCalledWith({
        product: 'p1',
        status: 'approved',
        isApproved: true,
      });
    });

    it('returns zeroed stats when the product has no approved reviews (Edge case)', async () => {
      const toArrayMock = jest.fn().mockResolvedValue([]);
      mockCollection.find.mockReturnValue({ toArray: toArrayMock });

      const summary = await ReviewModel.getProductRatingSummary('p1');

      expect(summary.averageRating).toBe(0);
      expect(summary.totalReviews).toBe(0);
      expect(summary.ratingCounts).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    });

    it('only aggregates reviews returned by the approved-only query (Edge case)', async () => {
      const reviews = [
        { _id: 'r1', rating: 5, status: 'approved', isApproved: true },
        { _id: 'r2', rating: 1, status: 'pending', isApproved: false },
        { _id: 'r3', rating: 1, status: 'rejected', isApproved: false },
      ];
      const toArrayMock = jest.fn().mockResolvedValue(reviews);
      mockCollection.find.mockReturnValue({ toArray: toArrayMock });

      const summary = await ReviewModel.getProductRatingSummary('p1');

      expect(mockCollection.find).toHaveBeenCalledWith({
        product: 'p1',
        status: 'approved',
        isApproved: true,
      });
      expect(summary.totalReviews).toBe(3);
      expect(summary.averageRating).toBe(2.3);
    });

    it('coerces a garbage rating to 5 for the aggregate (Impossible edge case)', async () => {
      const reviews = [
        { _id: 'r1', rating: 5, status: 'approved', isApproved: true },
        { _id: 'r2', rating: 'bogus', status: 'approved', isApproved: true },
      ];
      const toArrayMock = jest.fn().mockResolvedValue(reviews);
      mockCollection.find.mockReturnValue({ toArray: toArrayMock });

      const summary = await ReviewModel.getProductRatingSummary('p1');

      expect(summary.totalReviews).toBe(2);
      expect(summary.averageRating).toBe(5);
    });
  });
});
