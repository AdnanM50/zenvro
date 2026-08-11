import { NextRequest } from 'next/server';
import { PopupBannerModel } from '@/models/popup-banner.model';
import { api } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';

    const allBanners = await PopupBannerModel.findAll();
    const now = new Date();

    const activeBanners = allBanners.filter((b) => {
      if (b.status !== 'active') return false;
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;
      return true;
    });

    return api.ok(activeBanners, 'Active popups fetched');
  } catch (error) {
    console.error('Public popups error:', error);
    return api.serverError('Failed to fetch popups');
  }
}
