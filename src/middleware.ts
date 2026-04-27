import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/appConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

function isProtectedPath(pathname: string): boolean {
  return (
    /\/(dashboard)(\/.*)?$/.test(pathname)
    // protect all API routes except /api/auth/*
    || /\/api\/(?!auth\/).+/.test(pathname)
  );
}

function isAuthPath(pathname: string): boolean {
  return /\/(sign-in|sign-up)(\/.*)?$/.test(pathname);
}

async function hasValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('hsk-session')?.value;
  if (!token) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'dev-secret-please-change-in-production',
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

function getLocalePrefix(pathname: string): string {
  for (const locale of AllLocales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      if (locale !== AppConfig.defaultLocale) {
        return `/${locale}`;
      }
    }
  }
  return '';
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes: handle auth protection then pass through — skip intl middleware
  if (pathname.startsWith('/api/')) {
    if (isProtectedPath(pathname)) {
      const authenticated = await hasValidSession(request);
      if (!authenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    const authenticated = await hasValidSession(request);

    if (!authenticated) {
      const locale = getLocalePrefix(pathname);
      const signInUrl = new URL(`${locale}/sign-in`, request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  if (isAuthPath(pathname)) {
    const authenticated = await hasValidSession(request);

    if (authenticated) {
      const locale = getLocalePrefix(pathname);
      const homeUrl = new URL(`${locale}/`, request.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
