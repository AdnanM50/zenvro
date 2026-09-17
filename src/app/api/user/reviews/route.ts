import { NextRequest } from 'next/server';
import { requireUser } from '@/middlewares';
import { ReviewModel } from '@/models/review.model';
import { OrderModel } from '@/models/order.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request, { onUserNotFound: 'unauthorized', checkBlocked: true });
    if (auth instanceof Response) return auth;

    // Fetch reviews submitted by the user
    const userReviews = await ReviewModel.findByUser(auth.user._id);

    // Fetch user orders to identify purchased products
    const orders = await OrderModel.findByUser(auth.user.email, auth.user._id);

    // Extract unique purchased products from orders
    const purchasedMap = new Map<string, { id: string; name: string; image?: string; orderNumber: string; orderDate: string }>();

    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const productKey = (item.slug || item.key || item.name).toLowerCase();
          if (!purchasedMap.has(productKey)) {
            purchasedMap.set(productKey, {
              id: item.slug || item.key || item.name,
              name: item.name,
              image: item.image,
              orderNumber: order.orderNumber,
              orderDate: order.createdAt,
            });
          }
        }
      }
    }

    const purchasedProducts = Array.from(purchasedMap.values());

    return api.ok(
      {
        reviews: userReviews,
        purchasedProducts,
      },
      'User reviews and purchased products retrieved successfully'
    );
  } catch (error) {
    console.error('Get user reviews error:', error);
    return api.serverError('Failed to fetch user reviews');
  }
}
