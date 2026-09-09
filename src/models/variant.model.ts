import mongoose, { Schema, Model } from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import type { Variant, CreateVariantPayload } from '@/types';

const VariantSchema = new Schema<Variant>(
  {
    _id: { type: String, required: true },
    productId: { type: String, required: true, ref: 'Product', index: true },
    sku: { type: String, required: true, unique: true, trim: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, required: true, default: 0, min: 0 },
    image: { type: String, default: '' },
    weight: { type: Number, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

VariantSchema.index({ productId: 1, sku: 1 }, { unique: true });

let VariantMongooseModel: Model<Variant>;

try {
  VariantMongooseModel = mongoose.model<Variant>('Variant');
} catch {
  VariantMongooseModel = mongoose.model<Variant>('Variant', VariantSchema);
}

export { VariantMongooseModel };

function generateId(): string {
  return new mongoose.Types.ObjectId().toHexString();
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function areAttributesEqual(
  attr1: Record<string, string>,
  attr2: Record<string, string>
): boolean {
  const keys1 = Object.keys(attr1 || {}).sort();
  const keys2 = Object.keys(attr2 || {}).sort();
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key) => attr1[key] === attr2[key]);
}

export const VariantModel = {
  async create(data: CreateVariantPayload): Promise<Variant> {
    await connectToDatabase();

    if (data.productId && data.attributes) {
      const existingVariants = await VariantMongooseModel.find({
        productId: data.productId,
      }).exec();
      const duplicate = existingVariants.some((v) =>
        areAttributesEqual(v.attributes as Record<string, string>, data.attributes || {})
      );
      if (duplicate) {
        throw new Error('A variant with this attribute combination already exists for this product.');
      }
    }

    const _id = generateId();
    const doc = await VariantMongooseModel.create({
      _id,
      productId: data.productId,
      sku: data.sku.trim(),
      attributes: data.attributes || {},
      price: toFiniteNumber(data.price),
      salePrice: data.salePrice !== undefined && data.salePrice !== null ? toFiniteNumber(data.salePrice) : undefined,
      costPrice: data.costPrice !== undefined && data.costPrice !== null ? toFiniteNumber(data.costPrice) : undefined,
      stock: toFiniteNumber(data.stock),
      sold: toFiniteNumber(data.sold, 0),
      image: data.image || '',
      weight: data.weight !== undefined && data.weight !== null ? toFiniteNumber(data.weight) : undefined,
      status: data.status || 'active',
    });

    return (doc.toObject ? doc.toObject() : doc) as unknown as Variant;
  },

  async findById(_id: string): Promise<Variant | null> {
    await connectToDatabase();
    const doc = await VariantMongooseModel.findById(_id).exec();
    return doc ? ((doc.toObject ? doc.toObject() : doc) as unknown as Variant) : null;
  },

  async findBySku(sku: string): Promise<Variant | null> {
    await connectToDatabase();
    const doc = await VariantMongooseModel.findOne({ sku: sku.trim() }).exec();
    return doc ? ((doc.toObject ? doc.toObject() : doc) as unknown as Variant) : null;
  },

  async findByProductId(productId: string): Promise<Variant[]> {
    await connectToDatabase();
    const docs = await VariantMongooseModel.find({ productId }).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Variant);
  },

  async findAll(): Promise<Variant[]> {
    await connectToDatabase();
    const docs = await VariantMongooseModel.find({}).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Variant);
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
    productId?: string
  ): Promise<{ variants: Variant[]; total: number }> {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (productId) {
      filter.productId = productId;
    }
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ sku: regex }, { image: regex }];
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      VariantMongooseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      VariantMongooseModel.countDocuments(filter).exec(),
    ]);
    return {
      variants: docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Variant),
      total,
    };
  },

  async update(_id: string, data: Partial<CreateVariantPayload>): Promise<boolean> {
    await connectToDatabase();

    const existing = await VariantMongooseModel.findById(_id).exec();
    if (!existing) return false;

    const targetProductId = data.productId || existing.productId;
    const targetAttributes = data.attributes !== undefined ? data.attributes : existing.attributes;

    if (targetProductId && targetAttributes) {
      const otherVariants = await VariantMongooseModel.find({
        productId: targetProductId,
        _id: { $ne: _id },
      }).exec();
      const duplicate = otherVariants.some((v) =>
        areAttributesEqual(v.attributes as Record<string, string>, targetAttributes as Record<string, string>)
      );
      if (duplicate) {
        throw new Error('A variant with this attribute combination already exists for this product.');
      }
    }

    const updateFields: Record<string, unknown> = { ...data };
    const result = await VariantMongooseModel.updateOne({ _id }, { $set: updateFields }).exec();
    return result.modifiedCount > 0 || result.matchedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await VariantMongooseModel.deleteOne({ _id }).exec();
    return result.deletedCount > 0;
  },

  async deleteByProductId(productId: string): Promise<number> {
    await connectToDatabase();
    const result = await VariantMongooseModel.deleteMany({ productId }).exec();
    return result.deletedCount || 0;
  },
};
