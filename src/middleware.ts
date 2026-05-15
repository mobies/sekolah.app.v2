import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Define main domains that should NOT be treated as school subdomains
  const mainDomains = ['sekolah.app', 'localhost:3000', 'www.sekolah.app'];
  
  let subdomain = '';

  // Local development check
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1) {
      subdomain = parts[0];
    }
  } else {
    // Production check
    const parts = hostname.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    }
  }

  // If no subdomain or it's a main domain, continue
  if (!subdomain || mainDomains.includes(hostname)) {
    return NextResponse.next();
  }

  // For school subdomains, we can add a header to identify the tenant
  const response = NextResponse.next();
  response.headers.set('x-school-subdomain', subdomain);

  // Optional: Rewrite to a specific tenant path if needed
  // url.pathname = `/tenant/${subdomain}${url.pathname}`;
  // return NextResponse.rewrite(url);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
