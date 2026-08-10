import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { AnalyticsSettingsModel } from '@/models/analytics-settings.model';
import { api } from '@/lib/api-response';

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  if (!token) return api.unauthorized();
  const decoded = verifyAccessToken(token);
  if (!decoded) return api.unauthorized('Invalid or expired token');
  const user = await UserModel.findById(decoded.userId);
  if (!user || user.role !== 'admin') return api.forbidden();
  return { admin: user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const settings = await AnalyticsSettingsModel.get();
    return api.ok(settings, 'Analytics settings fetched');
  } catch (error) {
    console.error('Get analytics settings error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    delete body._id;

    const updated = await AnalyticsSettingsModel.update(body);
    return api.ok(updated, 'Analytics settings updated');
  } catch (error) {
    console.error('Update analytics settings error:', error);
    return api.serverError();
  }
}
