import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Task from '@/models/Task';
import { getToken } from 'next-auth/jwt';

// 📦 OBTENER TAREAS (GET)

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere autenticación válida' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const userId = token.sub;

    await connectDB();

    const query: any = { createdBy: userId };
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      tasks,
      count: tasks.length,
      status: status || 'all',
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
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere autenticación válida' },
        { status: 401 }
      );
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

    const task = await Task.create({
      ...body,
      createdBy: token.sub,
      status: body.status || 'pendiente',
      priority: body.priority || 'media',
    });

    return NextResponse.json(
      { message: 'Tarea creada exitosamente', task },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al crear tarea:', error);
    return NextResponse.json(
      { error: 'Error al crear la tarea', details: error?.message },
      { status: 500 }
    );
  }
}

// 🔄 ACTUALIZAR TAREA (PUT)

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere autenticación válida' },
        { status: 401 }
      );
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
    const userId = token.sub;

    await connectDB();

    const task = await Task.findOne({ _id: taskId, createdBy: userId });
    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada o sin permisos' },
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
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: 'No autorizado - Se requiere autenticación válida' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    if (!taskId) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarea' },
        { status: 400 }
      );
    }

    const userId = token.sub;

    await connectDB();

    const task = await Task.findOne({ _id: taskId, createdBy: userId });
    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada o sin permisos' },
        { status: 404 }
      );
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
