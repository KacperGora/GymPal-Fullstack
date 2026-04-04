import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@gympal/shared'],
  turbopack: {
    root: '..',
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
  headers: async () => {
    const isDev = process.env.NODE_ENV !== 'production';
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
    const isLocalBackend =
      backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');
    const localWs = isLocalBackend ? 'ws://localhost:* ws://127.0.0.1:* ' : '';

    // Looser CSP for development to allow HMR and debug tools
    const devCsp =
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      `connect-src 'self' ${localWs}ws: wss:; ` +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'";

    // Stricter CSP for production
    const prodCsp =
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      `connect-src 'self' ${localWs}https: wss:; ` +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'";

    const csp = isDev ? devCsp : prodCsp;

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
