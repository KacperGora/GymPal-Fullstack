import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';

const BASE_URL = 'https://gympal.app';

const PUBLIC_PATHS = ['/', '/login', '/register'];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${path === '/' ? '' : path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [
            l,
            `${BASE_URL}/${l}${path === '/' ? '' : path}`,
          ]),
        ),
      },
    })),
  );
}
