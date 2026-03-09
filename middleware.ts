import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isRegisterPage = request.nextUrl.pathname === '/register';
  const isHomePage = request.nextUrl.pathname === '/';
  const isPublicRoute = isLoginPage || isRegisterPage || isHomePage;

  if (!token && !isPublicRoute) {
    // Si no hay token y no es una ruta pública, redirige al login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (token && isPublicRoute) {
    // Si hay token y está intentando acceder a una ruta pública, redirige al dashboard
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
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
}