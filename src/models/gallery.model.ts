import { generateObjectId } from '@/lib/id';
import { getDb } from '@/lib/db';
import type { GalleryItem, CreateGalleryPayload } from '@/types';

const COLLECTION = 'gallery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function col(): Promise<any> {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export const defaultGalleryList: Array<CreateGalleryPayload> = [
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf',
    title: 'About Hero Image 1 - Streetwear Jacket',
    altText: 'Close-up of a colorful streetwear jacket',
    source: 'url',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve',
    title: 'About Hero Image 2 - Tan Model Jacket',
    altText: 'Model posing in a tan and black luxury streetwear jacket',
    source: 'url',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq',
    title: 'About Hero Image 3 - Back Detail',
    altText: 'Back detail of a jacket with artistic graphic design',
    source: 'url',
  },
  {
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1RoW5cBcoqT10u7JT7K7anHFGjv3NTjr8_mysaiCsk27iFErOxdP6goslnhBKFrJAC_iy8B-WQiIX7V9Tfq3ZQQ0DbKX0r3VZWRvRL8rx9a5vZ6yrB9wQOagG01U8I61_Y8LQ3h4X_uq6u5aA3yI1A8TPHK0I6FEbFTGhj8IPMtbCubZDYHng1tq9dl0pwI8nDdjwgiNLq4eIJQQwAMDg4xcvoJK2t1TVCM5VYhXT2E4qhkIg7Sq7cXGPMSQGBTsIMkBZr007K2R_',
    title: 'About Story Image - Editorial Fashion',
    altText: 'Editorial fashion photography of high-end accessories',
    source: 'url',
  },
];

export const GalleryModel = {
  async seedDefaults(): Promise<void> {
    const c = await col();
    for (const def of defaultGalleryList) {
      const existing = await c.findOne({ url: def.url });
      if (!existing) {
        await this.create(def);
      }
    }
  },

  async create(data: CreateGalleryPayload): Promise<GalleryItem> {
    const c = await col();
    const _id = generateObjectId();
    const now = new Date();
    const item: GalleryItem = {
      _id,
      url: data.url,
      publicId: data.publicId || undefined,
      title: data.title || '',
      altText: data.altText || '',
      mimeType: data.mimeType || '',
      size: data.size,
      width: data.width,
      height: data.height,
      source: data.source || 'url',
      createdAt: now,
      updatedAt: now,
    };
    await c.insertOne(item);
    return item;
  },

  async findById(_id: string): Promise<GalleryItem | null> {
    const c = await col();
    return c.findOne({ _id });
  },

  async findAll(): Promise<GalleryItem[]> {
    const c = await col();
    return c.find({}).sort({ createdAt: -1 }).toArray();
  },

  async findPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ items: GalleryItem[]; total: number }> {
    const c = await col();
    const filter: Record<string, unknown> = {};
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [{ title: regex }, { altText: regex }, { url: regex }];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      c.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      c.countDocuments(filter),
    ]);
    return { items, total };
  },

  async update(_id: string, data: Partial<CreateGalleryPayload>): Promise<boolean> {
    const c = await col();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateFields: any = { ...data, updatedAt: new Date() };
    const result = await c.updateOne({ _id }, { $set: updateFields });
    return result.modifiedCount > 0;
  },

  async delete(_id: string): Promise<boolean> {
    const c = await col();
    const result = await c.deleteOne({ _id });
    return result.deletedCount > 0;
  },
};
