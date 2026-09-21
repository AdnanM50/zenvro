import { NextResponse } from 'next/server';
import { RobotsModel } from '@/models/robots.model';
import { SITE_URL } from '@/seo/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const fallback = `# Robots.txt for VELOUR / ZENVRO
User-agent: *
Allow: /
Allow: /products
Allow: /products/*
Allow: /collections
Allow: /collections/*
Allow: /categories
Allow: /categories/*
Allow: /brands
Allow: /brands/*
Allow: /about
Allow: /contact
Allow: /privacy
Allow: /terms
Allow: /testimonials

# Disallow private and administrative areas
Disallow: /admin/
Disallow: /admin/*
Disallow: /api/admin/
Disallow: /api/admin/*
Disallow: /api/checkout/
Disallow: /api/checkout/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /cart
Disallow: /user-dashboard/
Disallow: /user-dashboard/*
Disallow: /login
Disallow: /signup
Disallow: /forgot-password

# Search Engine Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL.replace(/^https?:\/\//, '')}
`;

  try {
    const robots = await RobotsModel.get();
    let content = robots?.content?.trim();

    if (!content) {
      content = fallback;
    } else if (!content.includes('sitemap.xml')) {
      content += `\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new NextResponse(fallback, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
