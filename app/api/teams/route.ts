import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Team from '@/models/Team';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Obtener equipos del usuario
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
    } else {
      const teams = await Team.find();
      return NextResponse.json({
        success: true,
        teams,
        total: teams.length
      });
    }
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
    const body = await request.json();
    await connectDB();

    const team = await Team.create({
      name: body.name,
      description: body.description || '',
      owner: body.owner,
      members: body.members || [],
      color: body.color || '#3b82f6',
      createdAt: new Date(),
      updatedAt: new Date()
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    await connectDB();

    const team = await Team.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await connectDB();

    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      );
    }

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
