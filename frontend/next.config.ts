import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@gympal/shared'],
  turbopack: {
    resolveAlias: {
      '@gympal/shared': '../shared/dist/index.js',
    },
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${process.env.BACKEND_URL ?? 'http://localhost:4000'}/:path*`,
    },
  ],
};

export default withNextIntl(nextConfig);
