import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { SeoSettingsModel } from '@/models/seo-settings.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const settings = await SeoSettingsModel.get();
    return api.ok(settings, 'Site settings fetched');
  } catch (error) {
    console.error('Get site settings error:', error);
    return api.serverError('Failed to fetch site settings');
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
    return api.ok(updated, 'Site settings updated successfully');
  } catch (error) {
    console.error('Update site settings error:', error);
    return api.serverError('Failed to update site settings');
  }
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}
