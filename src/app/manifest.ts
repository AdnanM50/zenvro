import type { MetadataRoute } from 'next';
import { SITE_NAME, DEFAULT_SEO } from '@/seo/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} | International Fashion`,
    short_name: SITE_NAME,
    description: DEFAULT_SEO.defaultDescription,
    start_url: '/',
    display: 'standalone',
    background_color: DEFAULT_SEO.backgroundColor,
    theme_color: DEFAULT_SEO.themeColor,
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
