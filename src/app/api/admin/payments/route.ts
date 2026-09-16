import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { PaymentHistoryModel } from '@/models/payment-history.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = searchParams.get('search') || '';
    const paymentStatus = searchParams.get('paymentStatus') || 'all';
    const paymentMethod = searchParams.get('paymentMethod') || 'all';

    const [paginated, stats] = await Promise.all([
      PaymentHistoryModel.findPaginated({
        page,
        limit,
        search,
        paymentStatus,
        paymentMethod,
      }),
      PaymentHistoryModel.getStats(),
    ]);

    return api.ok(
      {
        records: paginated.records,
        stats,
        meta: {
          page: paginated.page,
          limit: paginated.limit,
          total: paginated.total,
          totalPages: paginated.totalPages,
        },
      },
      'Payment transactions fetched successfully'
    );
  } catch (error) {
    console.error('Get payment history error:', error);
    return api.serverError('Failed to fetch payment history');
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json().catch(() => null);
    if (!body || !body.id || !body.paymentStatus) {
      return api.badRequest('Missing required fields: id and paymentStatus');
    }

    const validStatuses = ['paid', 'pending', 'failed', 'refunded'];
    if (!validStatuses.includes(body.paymentStatus)) {
      return api.badRequest('Invalid paymentStatus. Must be paid, pending, failed, or refunded');
    }

    const success = await PaymentHistoryModel.updatePaymentStatus(body.id, body.paymentStatus);
    if (!success) {
      return api.notFound('Payment record not found or update failed');
    }

    return api.ok({ id: body.id, paymentStatus: body.paymentStatus }, 'Payment status updated successfully');
  } catch (error) {
    console.error('Update payment status error:', error);
    return api.serverError('Failed to update payment status');
  }
}
