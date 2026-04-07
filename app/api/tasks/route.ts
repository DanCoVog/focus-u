import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Helper: obtener email del usuario desde su ID
async function getEmailFromUserId(userId: string): Promise<string | null> {
  try {
    const user = await User.findById(userId).select('email');
    return user?.email || null;
  } catch {
    return null;
  }
}

// 📦 OBTENER TAREAS (GET) — filtradas por usuario
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

    const tasks = await Task.find({ creatorEmail: email })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      tasks,
      count: tasks.length,
      status: 'all'
    });
  } catch (error: any) {
    console.error('Error al obtener tareas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las tareas', details: error?.message },
      { status: 500 }
    );
  }
}

// 📝 CREAR TAREA (POST) — asigna email del usuario autenticado
export async function POST(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'El título es requerido y debe ser texto' },
        { status: 400 }
      );
    }

    const validStatus = ['pendiente', 'en-progreso', 'completada'];
    const validPriority = ['baja', 'media', 'alta'];

    if (body.status && !validStatus.includes(body.status)) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe ser: pendiente, en-progreso o completada' },
        { status: 400 }
      );
    }

    if (body.priority && !validPriority.includes(body.priority)) {
      return NextResponse.json(
        { error: 'Prioridad inválida. Debe ser: baja, media o alta' },
        { status: 400 }
      );
    }

    await connectDB();

    const email = await getEmailFromUserId(payload.id);

    const task = await Task.create({
      title: body.title,
      description: body.description || '',
      status: body.status || 'pendiente',
      priority: body.priority || 'media',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      creatorEmail: email || body.creatorEmail || '',
      createdBy: payload.id,
      completed: body.status === 'completada',
    });

    return NextResponse.json(
      { message: 'Tarea creada exitosamente', task },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear tarea:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Error de validación', details: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear la tarea', details: error?.message },
      { status: 500 }
    );
  }
}

// 🔄 ACTUALIZAR TAREA (PUT) — una sola actualización, valida antes
export async function PUT(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    if (!taskId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarea' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validar ANTES de actualizar
    const validStatus = ['pendiente', 'en-progreso', 'completada'];
    const validPriority = ['baja', 'media', 'alta'];

    if (body.status && !validStatus.includes(body.status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    if (body.priority && !validPriority.includes(body.priority)) {
      return NextResponse.json({ error: 'Prioridad inválida' }, { status: 400 });
    }

    await connectDB();

    const email = await getEmailFromUserId(payload.id);

    // Verificar que la tarea pertenece al usuario
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }
    if (existingTask.creatorEmail !== email) {
      return NextResponse.json({ error: 'No tienes permiso para editar esta tarea' }, { status: 403 });
    }

    // Actualizar (una sola vez)
    const updateData = { ...body };
    if (body.status === 'completada') {
      updateData.completed = true;
      updateData.completedAt = new Date();
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      message: 'Tarea actualizada exitosamente',
      task: updatedTask,
    });
  } catch (error: any) {
    console.error('Error al actualizar tarea:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la tarea', details: error?.message },
      { status: 500 }
    );
  }
}

// ❌ ELIMINAR TAREA (DELETE) — verifica propiedad
export async function DELETE(request: NextRequest) {
  try {
    const payload = verifyToken(request);
    if (!payload) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    if (!taskId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarea' },
        { status: 400 }
      );
    }

    await connectDB();

    const email = await getEmailFromUserId(payload.id);

    // Verificar que la tarea pertenece al usuario
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 });
    }
    if (task.creatorEmail !== email) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar esta tarea' }, { status: 403 });
    }

    await Task.findByIdAndDelete(taskId);

    return NextResponse.json({
      message: 'Tarea eliminada exitosamente',
      deletedTask: { id: taskId, title: task.title },
    });
  } catch (error: any) {
    console.error('Error al eliminar tarea:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la tarea', details: error?.message },
      { status: 500 }
    );
  }
}
