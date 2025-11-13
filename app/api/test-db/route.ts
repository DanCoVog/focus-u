import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Verificar estado de la conexión
    const isConnected = mongoose.connection.readyState === 1;

    // Obtener información de la base de datos
    const dbInfo = {
      state: isConnected ? 'Conectado' : 'Desconectado',
      database: mongoose.connection.db?.databaseName,
      collections: await mongoose.connection.db?.listCollections().toArray(),
      host: mongoose.connection.host,
    };

    // Intentar crear una colección de prueba
    try {
      const testData = {
        title: "Tarea de prueba",
        description: "Esta es una tarea de prueba",
        status: "pendiente",
        priority: "media"
      };

      // Obtener el modelo
      const Task = mongoose.models.Task;
      
      // Crear una tarea de prueba
      const task = await Task.create(testData);
      
      return NextResponse.json({
        success: true,
        message: '✅ Base de datos funcionando correctamente',
        dbInfo,
        testTask: task
      });

    } catch (testError: any) {
      return NextResponse.json({
        success: false,
        message: '❌ Error al crear tarea de prueba',
        error: testError.message,
        dbInfo
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: '❌ Error de conexión',
      error: error.message
    }, { status: 500 });
  }
}