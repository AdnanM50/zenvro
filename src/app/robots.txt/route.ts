import { NextResponse } from 'next/server';
import { RobotsModel } from '@/models/robots.model';

export async function GET() {
  try {
    const robots = await RobotsModel.get();
    return new NextResponse(robots.content, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zenvro.com';
    const fallback = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/admin/\nSitemap: ${baseUrl}/sitemap.xml\n`;
    return new NextResponse(fallback, {
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
