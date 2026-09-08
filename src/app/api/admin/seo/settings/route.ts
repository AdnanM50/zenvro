import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { SeoSettingsModel } from '@/models/seo-settings.model';
import { api } from '@/lib/api-response';
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
