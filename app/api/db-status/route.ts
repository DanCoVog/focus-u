import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Obtener información de la conexión
    const dbInfo = {
      isConnected: mongoose.connection.readyState === 1,
      databaseName: mongoose.connection.db?.databaseName,
      collections: await mongoose.connection.db?.listCollections().toArray(),
      host: mongoose.connection.host,
      port: mongoose.connection.port
    };

    return NextResponse.json({
      status: 'success',
      message: 'Conexión exitosa a MongoDB',
      dbInfo
    });
  } catch (error: any) {
    console.error('Error al verificar conexión:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Error al conectar a MongoDB',
      error: error.message
    }, { status: 500 });
  }
}