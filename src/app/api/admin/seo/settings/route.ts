import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { SeoSettingsModel } from '@/models/seo-settings.model';
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

    const settings = await SeoSettingsModel.get();
    return api.ok(settings, 'SEO settings fetched');
  } catch (error) {
    console.error('Get SEO settings error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    // Remove protected fields
    delete body._id;
    delete body.createdAt;
    delete body.updatedAt;

    const updated = await SeoSettingsModel.update(body);
    return api.ok(updated, 'SEO settings updated');
  } catch (error) {
    console.error('Update SEO settings error:', error);
    return api.serverError();
  }
}
