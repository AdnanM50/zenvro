export type UserRole = 'admin' | 'user';

export interface ApiResponse<T = unknown> {
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type { Category, CategorySEO, CategoryFormData } from './category';
export { defaultCategorySEO, emptyCategoryForm } from './category';

export type {
  Product,
  ProductSEO,
  ProductStatus,
  ProductGender,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
} from './product';
export { defaultProductSEO } from './product';

export type {
  Coupon,
  CouponType,
  CouponStatus,
  CouponAppliesTo,
  CreateCouponPayload,
  UpdateCouponPayload,
  CouponListParams,
} from './coupon';

export type { Tag, CreateTagPayload, UpdateTagPayload } from './tag';
export type { Brand, CreateBrandPayload, UpdateBrandPayload } from './brand';
export type { Attribute, CreateAttributePayload, UpdateAttributePayload } from './attribute';
export type { Variant, VariantAttributes, CreateVariantPayload, UpdateVariantPayload } from './variant';
export type { CollectionItem, CreateCollectionPayload, UpdateCollectionPayload } from './collection';

export type {
  GalleryItem,
  GallerySource,
  CreateGalleryPayload,
  UpdateGalleryPayload,
  GalleryListParams,
} from './gallery';

export type {
  UserStatus,
  UserAddress,
  WishlistItem,
  AddWishlistPayload,
  PublicUser,
  UserListParams,
} from './user';

export type {
  Review,
  ReviewStatus,
  ReviewRating,
  CreateReviewPayload,
  UpdateReviewPayload,
  ReviewListParams,
  ProductRatingSummary,
} from './review';

export type {
  InventoryItem,
  CreateInventoryPayload,
  InventoryListParams,
} from './inventory';

export type {
  Testimonial,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
  TestimonialListParams,
} from './testimonial';

export type {
  Page,
  PageSection,
  PageSEO,
  PageStatus,
  SectionType,
  CreatePagePayload,
  UpdatePagePayload,
  PageListParams,
} from './page';

export type {
  ApiResponseMeta,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponseEnvelope,
} from './api';
export { ApiError } from './api';

