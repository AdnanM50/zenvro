import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { UserModel } from '@/models/user.model';
import { api } from '@/lib/api-response';
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const stats = await UserModel.countByStatus();
    return api.ok(stats, 'User stats fetched');
  } catch (error) {
    console.error('Get user stats error:', error);
    return api.serverError();
  }
}
