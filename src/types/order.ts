export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

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
