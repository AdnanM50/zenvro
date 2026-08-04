import type { CategorySEO } from './category';

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  seo?: CategorySEO;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  seo?: CategorySEO;
  isActive?: boolean;
}

export interface UpdateBrandPayload extends Partial<CreateBrandPayload> {
  _id: string;
}
