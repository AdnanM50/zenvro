export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type OrderStatus = 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface PaymentDetails {
  cardBrand?: string; // 'visa' | 'mastercard' | 'amex' | 'discover' etc.
  last4?: string; // '4242'
  expMonth?: number;
  expYear?: number;
  funding?: string; // 'credit' | 'debit'
  bankName?: string; // e.g. 'JPMorgan Chase Bank'
  bankAccountNumber?: string; // e.g. '•••• •••• 8891'
  bankRoutingNumber?: string; // e.g. '021000021'
  receiptUrl?: string;
  refundedAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  refundId?: string;
}

export interface OrderItem {
  key: string;
  slug: string;
  name: string;
  category?: string;
  price: number;
  image?: string;
  size: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  userId?: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'stripe' | 'razorpay' | 'paypal' | 'cod';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentIntentId?: string;
  paymentDetails?: PaymentDetails;
  cancellationReason?: string;
  cancelledAt?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'stripe' | 'razorpay' | 'paypal' | 'cod';
  paymentIntentId?: string;
}
