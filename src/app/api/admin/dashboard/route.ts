import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { DashboardModel } from '@/models/dashboard.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const stats = await DashboardModel.getStats();
    return api.ok(stats, 'Dashboard analytics fetched successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return api.serverError('Failed to fetch dashboard analytics');
  }
}
