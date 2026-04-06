import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    // Conectar a base de datos
    await connectDB();

    // Obtener parámetros de fecha
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth();
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    // Crear rango de fechas para el mes completo
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    // Obtener todas las tareas del mes
    const tasks = await Task.find({
      dueDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ dueDate: 1 });

    // Convertir tareas a eventos de calendario
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
      { 
        error: 'Error al obtener eventos',
        details: error?.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Conectar a base de datos
    await connectDB();

    // Crear nueva tarea desde evento del calendario
    const task = await Task.create({
      title: body.title,
      description: body.description || '',
      dueDate: body.start || new Date(),
      status: 'pendiente',
      priority: body.priority || 'media',
      tags: body.tags || [],
      creatorEmail: body.creatorEmail || '',
      createdAt: new Date(),
      updatedAt: new Date()
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
      { 
        error: 'Error al crear evento',
        details: error?.message
      },
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

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Evento actualizado exitosamente',
      event: updatedTask
    });

  } catch (error: any) {
    console.error('Error al actualizar evento:', error);
    return NextResponse.json(
      { 
        error: 'Error al actualizar evento',
        details: error?.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('id');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del evento' },
        { status: 400 }
      );
    }

    await connectDB();

    await Task.findByIdAndDelete(eventId);

    return NextResponse.json({
      success: true,
      message: 'Evento eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar evento:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar evento',
        details: error?.message
      },
      { status: 500 }
    );
  }
}
