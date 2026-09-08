import { NextRequest } from 'next/server';
import { requireAdmin } from '@/middlewares';
import { RobotsModel } from '@/models/robots.model';
import { api } from '@/lib/api-response';
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const robots = await RobotsModel.get();
    return api.ok(robots, 'Robots.txt fetched');
  } catch (error) {
    console.error('Get robots error:', error);
    return api.serverError();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof Response) return auth;

    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return api.badRequest('content must be a string');
    }

    if (content.length > 10000) {
      return api.badRequest('content must not exceed 10000 characters');
    }

    const updated = await RobotsModel.update(content, auth.admin._id);
    return api.ok(updated, 'Robots.txt updated');
  } catch (error) {
    console.error('Update robots error:', error);
    return api.serverError();
  }
}
