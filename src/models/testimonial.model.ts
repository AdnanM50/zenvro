import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type {
  Testimonial,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
  TestimonialListParams,
} from '@/types/testimonial';

const COLLECTION = 'testimonials';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

function toFiniteNumber(value: unknown, fallback = 5): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const TestimonialModel = {
  async create(data: CreateTestimonialPayload): Promise<Testimonial> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();

    const testimonial: Testimonial = {
      _id,
      name: data.name.trim(),
      role: data.role.trim(),
      quote: data.quote.trim(),
      avatar: data.avatar ? data.avatar.trim() : '',
      rating: Math.min(5, Math.max(1, toFiniteNumber(data.rating, 5))),
      reviewCount: data.reviewCount !== undefined ? Math.max(0, toFiniteNumber(data.reviewCount, 0)) : undefined,
      isFeatured: data.isFeatured ?? false,
      status: data.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    await c.insertOne(testimonial);
    return testimonial;
  },

  async findById(_id: string): Promise<Testimonial | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findAllActive(): Promise<Testimonial[]> {
    const c = await col();
    return c.find({ status: 'active' }).sort({ isFeatured: -1, createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    params: TestimonialListParams = {}
  ): Promise<{ testimonials: Testimonial[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};

    if (params.search) {
      const regex = { $regex: params.search, $options: 'i' };
      filter.$or = [{ name: regex }, { role: regex }, { quote: regex }];
    }

    if (params.status) {
      filter.status = params.status;
    }

    if (params.isFeatured !== undefined) {
      filter.isFeatured = params.isFeatured;
    }

    const skip = (page - 1) * limit;
    const [testimonials, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);

    return { testimonials, total };
  },

  async update(_id: string, data: Partial<UpdateTestimonialPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { updatedAt: new Date() };

    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.role !== undefined) updateFields.role = data.role.trim();
    if (data.quote !== undefined) updateFields.quote = data.quote.trim();
    if (data.avatar !== undefined) updateFields.avatar = data.avatar.trim();
    if (data.rating !== undefined) updateFields.rating = Math.min(5, Math.max(1, toFiniteNumber(data.rating, 5)));
    if (data.reviewCount !== undefined) updateFields.reviewCount = Math.max(0, toFiniteNumber(data.reviewCount, 0));
    if (data.isFeatured !== undefined) updateFields.isFeatured = Boolean(data.isFeatured);
    if (data.status !== undefined) updateFields.status = data.status;

    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },

  async count(): Promise<number> {
    const c = await col();
    return c.countDocuments();
  },
};
