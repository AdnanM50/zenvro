import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type {
  Review,
  ReviewStatus,
  ReviewRating,
  CreateReviewPayload,
  ReviewListParams,
  ProductRatingSummary,
} from '@/types';

const COLLECTION = 'reviews';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

/** Coerces a value into a valid 1..5 rating, falling back to 5 for garbage input. */
function toRating(value: unknown): ReviewRating {
  const n = Math.round(Number(value));
  if (Number.isFinite(n) && n >= 1 && n <= 5) {
    return n as ReviewRating;
  }
  return 5;
}

const VALID_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected'];

function toStatus(value: unknown): ReviewStatus | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string' && (VALID_STATUSES as string[]).includes(value)) {
    return value as ReviewStatus;
  }
  return 'INVALID' as unknown as ReviewStatus;
}

function toBool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function buildFilters(params: ReviewListParams): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (params.search) {
    const regex = { $regex: params.search, $options: 'i' };
    filter.$or = [{ title: regex }, { comment: regex }];
  }
  if (params.status) filter.status = params.status;
  if (params.product) filter.product = params.product;
  if (params.rating !== undefined) filter.rating = params.rating;
  if (params.isApproved !== undefined) filter.isApproved = params.isApproved;
  if (params.isVerifiedPurchase !== undefined) {
    filter.isVerifiedPurchase = params.isVerifiedPurchase;
  }

  return filter;
}

export const ReviewModel = {
  async create(data: CreateReviewPayload): Promise<Review> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const review: Review = {
      _id,
      product: data.product,
      user: data.user || '',
      rating: toRating(data.rating),
      title: (data.title || '').trim(),
      comment: (data.comment || '').trim(),
      images: data.images || [],
      isVerifiedPurchase: toBool(data.isVerifiedPurchase),
      isApproved: false,
      status: 'pending',
      createdAt: now,
    };
    await c.insertOne(review);
    return review;
  },

  async findById(_id: string): Promise<Review | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findApprovedByProduct(product: string): Promise<Review[]> {
    const c = await col();
    return c
      .find({ product, status: 'approved', isApproved: true })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: ReviewListParams = {}
  ): Promise<{ reviews: Review[]; total: number }> {
    const c = await col();
    const filter = buildFilters(params);
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { reviews, total };
  },

  async update(_id: string, data: Partial<CreateReviewPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data };
    if (data.rating !== undefined) updateFields.rating = toRating(data.rating);
    if (data.title !== undefined) updateFields.title = (data.title || '').trim();
    if (data.comment !== undefined) updateFields.comment = (data.comment || '').trim();
    if (data.images !== undefined) updateFields.images = data.images || [];
    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async updateApproval(_id: string, status: ReviewStatus): Promise<boolean> {
    const c = await col();
    const parsed = toStatus(status);
    if (parsed === undefined || parsed === ('INVALID' as unknown as ReviewStatus)) {
      return false;
    }
    const result = await c.updateOne(
      { _id },
      { $set: { status: parsed, isApproved: parsed === 'approved' } }
    );
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async count(params: ReviewListParams = {}): Promise<number> {
    const c = await col();
    return c.countDocuments(buildFilters(params));
  },

  async getProductRatingSummary(product: string): Promise<ProductRatingSummary> {
    const c = await col();
    const reviews = await c
      .find({ product, status: 'approved', isApproved: true })
      .toArray();
    const ratingCounts: Record<ReviewRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const review of reviews) {
      const rating = toRating(review.rating);
      ratingCounts[rating] += 1;
      sum += rating;
    }
    const total = reviews.length;
    return {
      product,
      averageRating: total > 0 ? Number((sum / total).toFixed(1)) : 0,
      totalReviews: total,
      ratingCounts,
    };
  },
};
