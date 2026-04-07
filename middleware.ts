import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas que NO necesitan autenticación
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth',
  '/api/users',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acceso libre a rutas públicas
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Verificar token JWT para rutas protegidas
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // Si es una petición a la API, retornar 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }
    // Si es una página, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    // Verificar el token usando jose (funciona en Edge Runtime)
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    // Agregar el userId al header para que las API routes lo puedan leer
    const response = NextResponse.next();
    response.headers.set('x-user-id', payload.id as string);
    
    return response;
  } catch {
    // Token inválido o expirado
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    // Limpiar cookie inválida y redirigir a login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};