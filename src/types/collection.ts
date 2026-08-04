import type { CategorySEO } from './category';

export interface CollectionItem {
  _id: string;
  name: string;
  slug: string;
  banner?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  description?: string;
  seo?: CategorySEO;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionPayload {
  name: string;
  slug?: string;
  banner?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  description?: string;
  seo?: CategorySEO;
  isActive?: boolean;
}

export interface UpdateCollectionPayload extends Partial<CreateCollectionPayload> {
  _id: string;
}
