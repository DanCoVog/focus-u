import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
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

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth();
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Filtrar por usuario Y por rango de fechas
    const tasks = await Task.find({
      creatorEmail: email,
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ dueDate: 1 });

    const events = tasks.map((task: any) => ({
      id: task._id.toString(),
      title: task.title,
      start: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
      end: task.dueDate ? new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000).toISOString() : new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
      status: task.status,
      priority: task.priority,
      description: task.description,
      creatorEmail: task.creatorEmail,
      backgroundColor:
        task.status === 'completada' ? '#10b981' :
        task.status === 'en-progreso' ? '#f59e0b' :
        task.priority === 'alta' ? '#ef4444' :
        task.priority === 'media' ? '#3b82f6' : '#6b7280',
      borderColor:
        task.status === 'completada' ? '#059669' :
        task.status === 'en-progreso' ? '#d97706' :
        task.priority === 'alta' ? '#dc2626' :
        task.priority === 'media' ? '#1d4ed8' : '#4b5563'
    }));

    return NextResponse.json({
      success: true,
      events,
      total: events.length,
      month,
      year,
      monthName: new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    });

  } catch (error: any) {
    console.error('Error al obtener eventos del calendario:', error);
    return NextResponse.json(
      { error: 'Error al obtener eventos', details: error?.message },
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

    const task = await Task.create({
      title: body.title,
      description: body.description || '',
      dueDate: body.start || new Date(),
      status: 'pendiente',
      priority: body.priority || 'media',
      tags: body.tags || [],
      creatorEmail: email || '',
      createdBy: payload.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Evento creado exitosamente',
      event: {
        id: task._id.toString(),
        title: task.title,
        start: task.dueDate,
        status: task.status,
        priority: task.priority
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error al crear evento:', error);
    return NextResponse.json(
      { error: 'Error al crear evento', details: error?.message },
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
    const existing = await Task.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    if (existing.creatorEmail !== email) {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event: updatedTask
    });

  } catch (error: any) {
    console.error('Error al actualizar evento:', error);
    return NextResponse.json(
      { error: 'Error al actualizar evento', details: error?.message },
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
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json({ error: 'Se requiere el ID del evento' }, { status: 400 });
    }

    await connectDB();

    const email = await getEmailFromUserId(payload.id);
    const existing = await Task.findById(eventId);
    if (!existing) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }
    if (existing.creatorEmail !== email) {
      return NextResponse.json({ error: 'No tienes permiso' }, { status: 403 });
    }

    await Task.findByIdAndDelete(eventId);

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar evento:', error);
    return NextResponse.json(
      { error: 'Error al eliminar evento', details: error?.message },
      { status: 500 }
    );
  }
}
