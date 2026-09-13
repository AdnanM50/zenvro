import { Schema, model, models } from 'mongoose';
import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import { paginateCollection } from './common';
import { validateCreateTestimonial, validateUpdateTestimonial } from '@/validations/testimonial.validation';
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

/**
 * Clean Mongoose Schema definition for Testimonial entity
 */
export const testimonialSchema = new Schema<Testimonial>(
  {
    _id: { type: String, default: () => generateObjectId() },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    quote: { type: String, required: true, trim: true },
    avatar: { type: String, default: '', trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  },
  {
    timestamps: true,
  }
);

testimonialSchema.post<Testimonial>('save', function (doc: any, next) {
  if (doc) doc.__v = undefined;
  next();
});

export const TestimonialMongooseModel = models.Testimonial || model<Testimonial>('Testimonial', testimonialSchema);

export const TestimonialModel = {
  async create(data: CreateTestimonialPayload): Promise<Testimonial> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const validatedData = validateCreateTestimonial(data);

    const testimonial: Testimonial = {
      _id,
      ...validatedData,
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
    if (params.status) filter.status = params.status;
    if (params.isFeatured !== undefined) filter.isFeatured = params.isFeatured;

    const { items: testimonials, total } = await paginateCollection<Testimonial>(c, filter, { page, limit });
    return { testimonials, total };
  },

  async update(_id: string, data: Partial<UpdateTestimonialPayload>): Promise<boolean> {
    const c = await col();
    const updateFields = validateUpdateTestimonial(data);
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
