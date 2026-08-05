/** How a coupon's discount value is applied */
export type CouponType = 'percentage' | 'fixed';

/** Lifecycle status of a coupon */
export type CouponStatus = 'active' | 'inactive' | 'expired';

/** What a coupon can be applied to */
export type CouponAppliesTo = 'all' | 'products' | 'categories';

/** Core coupon entity returned by the API */
export interface Coupon {
  _id: string;
  name: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  perUserLimit?: number;
  usedCount: number;
  appliesTo: CouponAppliesTo;
  products: string[];
  categories: string[];
  status: CouponStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new coupon */
export interface CreateCouponPayload {
  name: string;
  code: string;
  type?: CouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  perUserLimit?: number;
  appliesTo?: CouponAppliesTo;
  products?: string[];
  categories?: string[];
  status?: CouponStatus;
}

/** Payload for updating an existing coupon (partial, _id required) */
export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
  _id: string;
}

/** Query parameters for listing/searching coupons */
export interface CouponListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CouponType;
  status?: CouponStatus;
}
