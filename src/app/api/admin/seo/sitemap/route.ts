import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth';
import { UserModel } from '@/models/user.model';
import { SitemapModel } from '@/models/sitemap.model';
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

    const config = await SitemapModel.getConfig();
    const counts = await SitemapModel.countItems();
    return api.ok({ config, counts }, 'Sitemap config fetched');
  } catch (error) {
    console.error('Get sitemap config error:', error);
    return api.serverError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { regenerate, ...configUpdate } = body;

    if (regenerate) {
      const result = await SitemapModel.regenerate();
      const config = await SitemapModel.getConfig();
      const counts = await SitemapModel.countItems();
      return api.ok(
        { config, counts, regenerated: result.count },
        `Sitemap regenerated with ${result.count} items`
      );
    }

    // Remove protected fields
    delete configUpdate._id;
    delete configUpdate.lastGenerated;

    const updated = await SitemapModel.updateConfig(configUpdate);
    const counts = await SitemapModel.countItems();
    return api.ok({ config: updated, counts }, 'Sitemap config updated');
  } catch (error) {
    console.error('Update sitemap config error:', error);
    return api.serverError();
  }
}
