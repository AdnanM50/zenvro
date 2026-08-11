// ---------------------------------------------------------------------------
// Marketing Module Types
// Popup Banners, Flash Sales and Home Sections
// ---------------------------------------------------------------------------

// ── Popup Banners ───────────────────────────────────────────────────────────

/** Lifecycle status of a popup banner */
export type PopupBannerStatus = 'active' | 'inactive';

/** Core popup banner entity returned by the API */
export interface PopupBanner {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  startDate?: string;
  endDate?: string;
  status: PopupBannerStatus;
  sortOrder: number;
  triggerType?: string;
  targetPage?: string;
  discountCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new popup banner */
export interface CreatePopupBannerPayload {
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  startDate?: string;
  endDate?: string;
  status?: PopupBannerStatus;
  sortOrder?: number;
  triggerType?: string;
  targetPage?: string;
  discountCode?: string;
}

/** Payload for updating an existing popup banner (partial, _id required) */
export interface UpdatePopupBannerPayload extends Partial<CreatePopupBannerPayload> {
  _id: string;
}

/** Query parameters for listing/searching popup banners */
export interface PopupBannerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PopupBannerStatus;
}

// ── Flash Sales ─────────────────────────────────────────────────────────────

/** How a flash sale discount value is applied */
export type FlashSaleDiscountType = 'percentage' | 'fixed';

/** Lifecycle status of a flash sale */
export type FlashSaleStatus = 'active' | 'scheduled' | 'ended' | 'inactive';

/** Core flash sale entity returned by the API */
export interface FlashSale {
  _id: string;
  title: string;
  description?: string;
  discountType: FlashSaleDiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  productIds: string[];
  showOnHome: boolean;
  sortOrder: number;
  status: FlashSaleStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new flash sale */
export interface CreateFlashSalePayload {
  title: string;
  description?: string;
  discountType?: FlashSaleDiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  productIds?: string[];
  showOnHome?: boolean;
  sortOrder?: number;
  status?: FlashSaleStatus;
}

/** Payload for updating an existing flash sale (partial, _id required) */
export interface UpdateFlashSalePayload extends Partial<CreateFlashSalePayload> {
  _id: string;
}

/** Query parameters for listing/searching flash sales */
export interface FlashSaleListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: FlashSaleStatus;
}

// ── Home Sections ───────────────────────────────────────────────────────────

/** What kind of content a home section renders */
export type HomeSectionType = 'featured-products' | 'promo-banner' | 'flash-sale' | 'custom';

/** Core home section entity returned by the API */
export interface HomeSection {
  _id: string;
  title: string;
  subtitle?: string;
  sectionType: HomeSectionType;
  enabled: boolean;
  sortOrder: number;
  productIds: string[];
  imageUrl?: string;
  link?: string;
  linkText?: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Payload for creating a new home section */
export interface CreateHomeSectionPayload {
  title: string;
  subtitle?: string;
  sectionType?: HomeSectionType;
  enabled?: boolean;
  sortOrder?: number;
  productIds?: string[];
  imageUrl?: string;
  link?: string;
  linkText?: string;
  content?: string;
}

/** Payload for updating an existing home section (partial, _id required) */
export interface UpdateHomeSectionPayload extends Partial<CreateHomeSectionPayload> {
  _id: string;
}

/** Query parameters for listing/searching home sections */
export interface HomeSectionListParams {
  page?: number;
  limit?: number;
  search?: string;
  sectionType?: HomeSectionType;
  enabled?: boolean;
}
