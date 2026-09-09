import mongoose, { Schema, Model } from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import type {
  Product,
  CreateProductPayload,
  ProductSEO,
  ProductListParams as ProductFilters,
  ProductGender,
} from '@/types';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Coerces a value into a finite number, falling back to fallback */
function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Coerces a value into a finite number, or undefined when empty/invalid. */
function toFiniteOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function defaultSEO(): ProductSEO {
  return {
    title: '',
    description: '',
    focusKeyword: '',
    keywords: [],
    canonical: '',
    robots: 'index, follow',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    sitemap: {
      include: true,
      priority: 0.8,
      changefreq: 'weekly',
    },
  };
}

const ProductSitemapSchema = new Schema(
  {
    include: { type: Boolean, default: true },
    priority: { type: Number, default: 0.8 },
    changefreq: {
      type: String,
      enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
      default: 'weekly',
    },
  },
  { _id: false }
);

const ProductSEOSchema = new Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    focusKeyword: { type: String, default: '' },
    keywords: { type: [String], default: [] },
    canonical: { type: String, default: '' },
    robots: { type: String, default: 'index, follow' },
    ogTitle: { type: String, default: '' },
    ogDescription: { type: String, default: '' },
    ogImage: { type: String, default: '' },
    twitterTitle: { type: String, default: '' },
    twitterDescription: { type: String, default: '' },
    twitterImage: { type: String, default: '' },
    sitemap: { type: ProductSitemapSchema, default: () => ({ include: true, priority: 0.8, changefreq: 'weekly' }) },
  },
  { _id: false }
);

const ProductSchema = new Schema<Product>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    barcode: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },

    category: { type: String, required: true, ref: 'Category', index: true },
    brand: { type: String, required: true, ref: 'Brand', index: true },

    collection: { type: String, default: '', ref: 'Collection', index: true },
    tags: { type: [String], default: [] },

    featuredImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    video: { type: String, default: '' },
    media: {
      featuredImage: { type: String, default: '' },
      gallery: { type: [String], default: [] },
      videoUrl: { type: String, default: '' },
    },

    regularPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },

    gender: {
      type: String,
      default: '',
    },
    material: { type: String, default: '' },
    careInstruction: { type: String, default: '' },
    specifications: { type: Schema.Types.Mixed, default: {} },

    seo: { type: ProductSEOSchema, default: () => defaultSEO() },
  },
  {
    timestamps: true,
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

let ProductMongooseModel: Model<Product>;

try {
  ProductMongooseModel = mongoose.model<Product>('Product');
} catch {
  ProductMongooseModel = mongoose.model<Product>('Product', ProductSchema);
}

export { ProductMongooseModel };

function generateId(): string {
  return new mongoose.Types.ObjectId().toHexString();
}

function buildFilters(params: ProductFilters): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  if (params.search) {
    const regex = { $regex: params.search, $options: 'i' };
    filter.$or = [{ name: regex }, { sku: regex }, { barcode: regex }];
  }

  if (params.category) filter.category = params.category;
  if (params.brand) filter.brand = params.brand;
  if (params.collection) filter.collection = params.collection;
  if (params.tag) filter.tags = params.tag;
  if (params.status) filter.status = params.status;
  if (params.gender) filter.gender = params.gender;
  if (params.isFeatured !== undefined) filter.isFeatured = params.isFeatured;
  if (params.isNewArrival !== undefined) filter.isNewArrival = params.isNewArrival;
  if (params.isTrending !== undefined) filter.isTrending = params.isTrending;

  if (params.ids && params.ids.length > 0) {
    filter._id = { $in: params.ids };
  }

  return filter;
}

export const ProductModel = {
  async create(data: CreateProductPayload): Promise<Product> {
    await connectToDatabase();

    if (!data.category || !data.category.trim()) {
      throw new Error('Category is required');
    }
    if (!data.brand || !data.brand.trim()) {
      throw new Error('Brand is required');
    }

    const _id = generateId();
    const featuredImage = data.media?.featuredImage || data.featuredImage || '';
    const gallery = data.media?.gallery || data.gallery || [];
    const video = data.media?.videoUrl || data.video || '';

    const productDoc = {
      _id,
      name: data.name.trim(),
      slug: data.slug || slugify(data.name),
      sku: data.sku.trim(),
      barcode: data.barcode || '',
      shortDescription: data.shortDescription || '',
      description: data.description || '',
      category: data.category,
      brand: data.brand,
      collection: data.collection || '',
      tags: data.tags || [],
      featuredImage,
      gallery,
      video,
      media: {
        featuredImage,
        gallery,
        videoUrl: video,
      },
      regularPrice: toFiniteNumber(data.regularPrice),
      salePrice: toFiniteOrUndefined(data.salePrice) ?? 0,
      costPrice: toFiniteOrUndefined(data.costPrice) ?? 0,
      stock: toFiniteNumber(data.stock),
      lowStock: toFiniteOrUndefined(data.lowStock) ?? 0,
      sold: 0,
      status: data.status || 'published',
      isFeatured: data.isFeatured ?? false,
      isNewArrival: data.isNewArrival ?? false,
      isTrending: data.isTrending ?? false,
      gender: (data.gender || '') as ProductGender,
      material: data.material || '',
      careInstruction: data.careInstruction || '',
      specifications: data.specifications || {},
      seo: { ...defaultSEO(), ...(data.seo || {}) },
    };

    const doc = await ProductMongooseModel.create(productDoc);
    return (doc.toObject ? doc.toObject() : doc) as unknown as Product;
  },

  async findById(_id: string): Promise<Product | null> {
    await connectToDatabase();
    const doc = await ProductMongooseModel.findById(_id).exec();
    return doc ? ((doc.toObject ? doc.toObject() : doc) as unknown as Product) : null;
  },

  async findBySlug(slug: string): Promise<Product | null> {
    await connectToDatabase();
    const doc = await ProductMongooseModel.findOne({ slug }).exec();
    return doc ? ((doc.toObject ? doc.toObject() : doc) as unknown as Product) : null;
  },

  async findBySku(sku: string): Promise<Product | null> {
    await connectToDatabase();
    const doc = await ProductMongooseModel.findOne({ sku: sku.trim() }).exec();
    return doc ? ((doc.toObject ? doc.toObject() : doc) as unknown as Product) : null;
  },

  async findAll(): Promise<Product[]> {
    await connectToDatabase();
    const docs = await ProductMongooseModel.find({}).sort({ createdAt: -1 }).exec();
    return docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Product);
  },

  async findPaginated(
    page: number,
    limit: number,
    params: ProductFilters = {}
  ): Promise<{ products: Product[]; total: number }> {
    await connectToDatabase();
    const filter = buildFilters(params);
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductMongooseModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      ProductMongooseModel.countDocuments(filter).exec(),
    ]);
    return {
      products: docs.map((doc) => (doc.toObject ? doc.toObject() : doc) as unknown as Product),
      total,
    };
  },

  async update(_id: string, data: Partial<CreateProductPayload>): Promise<boolean> {
    await connectToDatabase();
    const updateFields: Record<string, unknown> = { ...data };

    delete updateFields.sold;

    if (data.name && !data.slug) {
      updateFields.slug = slugify(data.name);
    }

    const featuredImage = data.media?.featuredImage ?? data.featuredImage;
    const gallery = data.media?.gallery ?? data.gallery;
    const video = data.media?.videoUrl ?? data.video;

    if (featuredImage !== undefined || gallery !== undefined || video !== undefined || data.media !== undefined) {
      const existing = await ProductMongooseModel.findById(_id).exec();
      const finalFeatured = featuredImage ?? existing?.media?.featuredImage ?? existing?.featuredImage ?? '';
      const finalGallery = gallery ?? existing?.media?.gallery ?? existing?.gallery ?? [];
      const finalVideo = video ?? existing?.media?.videoUrl ?? existing?.video ?? '';

      updateFields.featuredImage = finalFeatured;
      updateFields.gallery = finalGallery;
      updateFields.video = finalVideo;
      updateFields.media = {
        featuredImage: finalFeatured,
        gallery: finalGallery,
        videoUrl: finalVideo,
      };
    }

    const result = await ProductMongooseModel.updateOne({ _id }, { $set: updateFields }).exec();
    return result.modifiedCount > 0 || result.matchedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await ProductMongooseModel.deleteOne({ _id }).exec();
    return result.deletedCount > 0;
  },

  async count(): Promise<number> {
    await connectToDatabase();
    return ProductMongooseModel.countDocuments().exec();
  },
};
