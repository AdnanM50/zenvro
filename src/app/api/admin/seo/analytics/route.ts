import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { AnalyticsSettingsModel } from '@/models/analytics-settings.model';
import { api } from '@/lib/api-response';
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
