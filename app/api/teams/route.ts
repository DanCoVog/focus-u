import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

async function getEmailFromUserId(userId: string): Promise<string | null> {
  try {
    const user = await User.findById(userId).select('email');
    return user?.email || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    await connectDB();

    const email = await getEmailFromUserId(payload.id);
    if (!email) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener equipos donde el usuario es owner o miembro
    const teams = await Team.find({
      $or: [
        { owner: email },
        { 'members.email': email }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      teams,
      total: teams.length
    });
  } catch (error: any) {
    console.error('Error al obtener equipos:', error);
    return NextResponse.json(
      { error: 'Error al obtener equipos', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    const email = await getEmailFromUserId(payload.id);

    const team = await Team.create({
      name: body.name,
      description: body.description || '',
      owner: email, // Siempre del token, no del body
      members: body.members || [],
      color: body.color || '#3b82f6',
    });

    return NextResponse.json({
      success: true,
      message: 'Equipo creado exitosamente',
      team
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear equipo:', error);
    return NextResponse.json(
      { error: 'Error al crear equipo', details: error?.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    await connectDB();

    const email = await getEmailFromUserId(payload.id);

    // Verificar propiedad
    const existing = await Team.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
    }
    if (existing.owner !== email) {
      return NextResponse.json({ error: 'Solo el propietario puede editar el equipo' }, { status: 403 });
    }

    const team = await Team.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Equipo actualizado',
      team
    });
  } catch (error: any) {
    console.error('Error al actualizar equipo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar equipo', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await connectDB();

    const email = await getEmailFromUserId(payload.id);

    // Verificar propiedad
    const existing = await Team.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Equipo no encontrado' }, { status: 404 });
    }
    if (existing.owner !== email) {
      return NextResponse.json({ error: 'Solo el propietario puede eliminar el equipo' }, { status: 403 });
    }

    await Team.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Equipo eliminado'
    });
  } catch (error: any) {
    console.error('Error al eliminar equipo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar equipo', details: error?.message },
      { status: 500 }
    );
  }
}
