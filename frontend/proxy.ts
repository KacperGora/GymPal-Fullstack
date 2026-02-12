import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Auth protection is handled client-side by AuthProvider/useAuth
// Server-side middleware cannot access cross-domain cookies (backend sets cookies on its own domain)
export default function proxy(req: NextRequest) {
  return intlMiddleware(req);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
