import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/profile', '/workouts'],
    },
    sitemap: 'https://gympal.app/sitemap.xml',
  };
}
