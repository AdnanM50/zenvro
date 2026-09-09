import mongoose, { Schema, Model } from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import type { Attribute, CreateAttributePayload } from '@/types';

const AttributeSchema = new Schema<Attribute>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: true, trim: true },
    values: { type: [String], default: [] },
    useForVariants: { type: Boolean, default: true },
    isVariant: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AttributeSchema.pre('save', function (this: any) {
  if (this.useForVariants !== undefined) {
    this.isVariant = this.useForVariants;
  } else if (this.isVariant !== undefined) {
    this.useForVariants = this.isVariant;
  }
});

let AttributeMongooseModel: Model<Attribute>;

try {
  AttributeMongooseModel = mongoose.model<Attribute>('Attribute');
} catch {
  AttributeMongooseModel = mongoose.model<Attribute>('Attribute', AttributeSchema);
}

export { AttributeMongooseModel };

function generateId(): string {
  return new mongoose.Types.ObjectId().toHexString();
}

export const AttributeModel = {
  async create(data: CreateAttributePayload): Promise<Attribute> {
    await connectToDatabase();
    const useForVar = data.useForVariants ?? data.isVariant ?? true;
    const _id = generateId();
    const doc = await AttributeMongooseModel.create({
      _id,
      name: data.name.trim(),
      values: data.values || [],
      useForVariants: useForVar,
      isVariant: useForVar,
    });
    return (doc.toObject ? doc.toObject() : doc) as unknown as Attribute;
  },

  async findById(_id: string): Promise<Attribute | null> {
    await connectToDatabase();
    const doc = await AttributeMongooseModel.findById(_id).exec();
    return doc ? ((doc.toObject ? doc.toObject() : doc) as unknown as Attribute) : null;
  },

  async findAll(): Promise<Attribute[]> {
    await connectToDatabase();
    const docs = await AttributeMongooseModel.find({}).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Attribute);
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ attributes: Attribute[]; total: number }> {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ name: regex }, { values: regex }];
    }
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      AttributeMongooseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      AttributeMongooseModel.countDocuments(filter).exec(),
    ]);
    return {
      attributes: docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Attribute),
      total,
    };
  },

  async update(_id: string, data: Partial<CreateAttributePayload>): Promise<boolean> {
    await connectToDatabase();
    const updateFields: Record<string, unknown> = { ...data };
    if (data.useForVariants !== undefined) {
      updateFields.isVariant = data.useForVariants;
    } else if (data.isVariant !== undefined) {
      updateFields.useForVariants = data.isVariant;
    }

    const result = await AttributeMongooseModel.updateOne({ _id }, { $set: updateFields }).exec();
    return result.modifiedCount > 0 || result.matchedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await AttributeMongooseModel.deleteOne({ _id }).exec();
    return result.deletedCount > 0;
  },
};
