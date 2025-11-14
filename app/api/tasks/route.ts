import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';

// 📦 OBTENER TAREAS (GET)

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const tasks = await Task.find()
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

// 📝 CREAR TAREA (POST)

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Iniciando creación de tarea...');

    const body = await request.json();
    console.log('📄 Datos recibidos:', body);

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

    const task = await Task.create({
      title: body.title,
      description: body.description || '',
      status: body.status || 'pendiente',
      priority: body.priority || 'media',
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      creatorEmail: body.creatorEmail || '',
      completed: body.status === 'completada',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Tarea creada:', task);

    return NextResponse.json(
      { message: 'Tarea creada exitosamente', task },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear tarea:', error);
    
    // Manejar errores de validación
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

// 🔄 ACTUALIZAR TAREA (PUT)

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    if (!taskId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarea' },
        { status: 400 }
      );
    }

    const body = await request.json();

    await connectDB();

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        ...body,
        status: body.status || undefined,
        priority: body.priority || undefined,
        description: body.description || undefined
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

    const validStatus = ['pendiente', 'en-progreso', 'completada'];
    const validPriority = ['baja', 'media', 'alta'];

    if (body.status && !validStatus.includes(body.status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      );
    }

    if (body.priority && !validPriority.includes(body.priority)) {
      return NextResponse.json(
        { error: 'Prioridad inválida' },
        { status: 400 }
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { ...body },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'username email');

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




// ❌ ELIMINAR TAREA (DELETE)

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    if (!taskId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarea' },
        { status: 400 }
      );
    }

    await connectDB();

    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      );
    }

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
