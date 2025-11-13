import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'JWT_SECRET no configurado' }, { status: 500 });
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '1d' });

    const response = NextResponse.json({
      message: 'Login exitoso',
      user: { id: user._id, username: (user as any).username, email: user.email },
    });

    // Establecer cookie HTTP-only segura
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Configuración de MONGODB_URI y JWT_SECRET
// MONGODB_URI=tu_uri_de_mongodb
// JWT_SECRET=un_secreto_seguro_para_jwt
