import {
  HAS_PROFILE_COOKIE,
  HAS_PROFILE_FALSE,
  HAS_PROFILE_TRUE,
} from "@gympal/shared";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const protectedPaths = ["/dashboard", "/profile", "/welcome"];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const pathnameWithoutLocale = routing.locales.reduce(
    (path, locale) =>
      path.startsWith(`/${locale}/`)
        ? path.slice(locale.length + 1)
        : path === `/${locale}`
          ? "/"
          : path,
    pathname,
  );

  const isProtected = protectedPaths.some(
    (p) =>
      pathnameWithoutLocale === p || pathnameWithoutLocale.startsWith(`${p}/`),
  );

  if (isProtected) {
    const token = req.cookies.get("access_token");
    if (!token) {
      const hasLocale = routing.locales.some(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
      );
      const locale = hasLocale ? pathname.split("/")[1] : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    const hasProfileCookie = req.cookies.get(HAS_PROFILE_COOKIE)?.value;
    const hasProfileKnown =
      hasProfileCookie === HAS_PROFILE_TRUE ||
      hasProfileCookie === HAS_PROFILE_FALSE;
    const hasProfile = hasProfileCookie === HAS_PROFILE_TRUE;
    const isWelcome =
      pathnameWithoutLocale === "/welcome" ||
      pathnameWithoutLocale.startsWith("/welcome/");

    if (isWelcome && hasProfile) {
      const hasLocale = routing.locales.some(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
      );
      const locale = hasLocale ? pathname.split("/")[1] : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/profile`, req.url));
    }

    if (!isWelcome && hasProfileKnown && !hasProfile) {
      const hasLocale = routing.locales.some(
        (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`,
      );
      const locale = hasLocale ? pathname.split("/")[1] : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/welcome`, req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
