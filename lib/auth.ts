import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface TokenPayload {
  id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifica el token JWT de una cookie y retorna el payload.
 * Retorna null si el token no existe o es inválido.
 */
export function verifyToken(request: NextRequest): TokenPayload | null {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET no configurado');
      return null;
    }

    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extrae el email del usuario desde el token JWT.
 * Para usar en API routes que necesitan saber quién es el usuario.
 * Retorna null si no hay autenticación válida.
 */
export async function getUserFromRequest(request: NextRequest): Promise<{ userId: string; email: string } | null> {
  const payload = verifyToken(request);
  if (!payload) return null;

  // El token contiene el id del usuario, pero necesitamos el email
  // Lo obtenemos del header que el middleware puede setear, o de la cookie
  const email = request.headers.get('x-user-email') || '';
  
  return {
    userId: payload.id,
    email,
  };
}

/**
 * Helper para retornar error 401
 */
export function unauthorizedResponse() {
  return Response.json(
    { error: 'No autenticado. Por favor inicia sesión.' },
    { status: 401 }
  );
}
