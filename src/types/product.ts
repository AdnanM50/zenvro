// ---------------------------------------------------------------------------
// Product Entity Types
// Aligned with the API response format defined in src/lib/api-response.ts
// ---------------------------------------------------------------------------

/** Individual product review */
export interface ProductReview {
  _id: string;
  userId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/** Individual product comment */
export interface ProductComment {
  _id: string;
  author: string;
  text: string;
  time: string;
}

/** Core product entity returned by the API */
export interface Product {
  _id: string;
  slug: string;
  name: string;
  category: string;
  year: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewsCount: number;
  tagline: string;
  description: string;
  image: string;
  images: string[];
  color: string;
  material: string;
  fit: string;
  sizes: string[];
  stock: number;
  sku: string;
  details: string[];
  reviews: ProductReview[];
  comments: ProductComment[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a new product */
export interface CreateProductPayload {
  name: string;
  slug: string;
  category: string;
  year?: string;
  price: number;
  compareAtPrice?: number;
  tagline?: string;
  description: string;
  image: string;
  images?: string[];
  color?: string;
  material?: string;
  fit?: string;
  sizes?: string[];
  stock: number;
  sku: string;
  details?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
}

/** Payload for updating an existing product (partial, _id required) */
export interface UpdateProductPayload extends Partial<CreateProductPayload> {
  _id: string;
}

/** Query parameters for listing/searching products */
export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  isFeatured?: boolean;
  isActive?: boolean;
  tags?: string[];
}
