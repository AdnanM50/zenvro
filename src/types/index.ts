export type UserRole = 'admin' | 'user';

export interface ApiResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type { Category, CategorySEO, CategoryFormData } from './category';
export { defaultCategorySEO, emptyCategoryForm } from './category';

export type {
  Product,
  ProductReview,
  ProductComment,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
} from './product';

export type {
  ApiResponseMeta,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponseEnvelope,
} from './api';
export { ApiError } from './api';
