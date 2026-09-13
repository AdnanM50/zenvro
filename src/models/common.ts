import type { Collection, Filter, Sort } from 'mongodb';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1> | Sort;
  projection?: Record<string, number>;
}

/**
 * Common pagination helper for MongoDB native driver collections.
 */
export async function paginateCollection<T extends Record<string, any>>(
  collection: Collection<any>,
  filter: Filter<any> = {},
  options: PaginationOptions = {}
): Promise<{ items: T[]; total: number }> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);
  const skip = (page - 1) * limit;
  const sort = (options.sort || { createdAt: -1 }) as Sort;
  const findOptions: any = { sort, skip, limit };
  if (options.projection) {
    findOptions.projection = options.projection;
  }

  const [docs, total] = await Promise.all([
    collection.find(filter, findOptions).toArray(),
    collection.countDocuments(filter),
  ]);

  return { items: docs as unknown as T[], total };
}

/**
 * Common pagination helper for Mongoose models.
 */
export async function paginateMongoose<T>(
  model: any,
  filter: Record<string, any> = {},
  options: PaginationOptions = {}
): Promise<{ items: T[]; total: number }> {
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 10);
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  const [docs, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    model.countDocuments(filter).exec(),
  ]);

  const items = docs.map((doc: any) => (doc.toObject ? doc.toObject() : doc) as T);
  return { items, total };
}
