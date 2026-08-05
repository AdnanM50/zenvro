/** Lifecycle status of a user account */
export type UserStatus = 'active' | 'inactive' | 'blocked';

/** A saved shipping/billing address on a user account */
export interface UserAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

/** An item saved to a user's wishlist */
export interface WishlistItem {
  product: string;
  addedAt: Date;
}

/** Payload for adding a product to the wishlist */
export interface AddWishlistPayload {
  product: string;
}

/** Full user entity returned by admin APIs (password excluded) */
export interface PublicUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  status: UserStatus;
  addresses: UserAddress[];
  wishlist: WishlistItem[];
  createdAt: Date;
}

/** Query parameters for listing/searching users */
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: 'admin' | 'user';
}
