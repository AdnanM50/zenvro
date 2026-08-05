// ---------------------------------------------------------------------------
// Hooks Barrel Export
// ---------------------------------------------------------------------------

// ── Generic API hooks (use these for any entity) ───────────────────────────
export {
  useApiGet,
  useApiPost,
  useApiPut,
  useApiDelete,
  createQueryKeys,
} from './use-api';

export type {
  UseApiGetParams,
  UseApiPostParams,
  UseApiPutParams,
  UseApiDeleteParams,
} from './use-api';

// ── Product-specific hooks (pre-built convenience hooks) ───────────────────
export {
  useGetProducts,
  useGetProduct,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  productKeys,
} from './use-products';

// ── Coupon-specific hooks (pre-built convenience hooks) ────────────────────
export {
  useGetCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  couponKeys,
} from './use-coupons';
