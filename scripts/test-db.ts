import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb';

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar a MongoDB...');
    await connectDB();

    if (mongoose.connection.readyState === 1) {
      console.log('✅ Conexión exitosa a MongoDB');
      console.log('📊 Información de la conexión:');
      const db = mongoose.connection.db;
      if (!db) {
        console.log('❌ No se pudo acceder a la base de datos');
        return;
      }

      console.log(`- Base de datos: ${db.databaseName}`);
      console.log(`- Host: ${mongoose.connection.host}`);
      console.log(`- Puerto: ${mongoose.connection.port}`);

      // Listar colecciones
      const collections = await db.listCollections().toArray();
      console.log('\n📁 Colecciones disponibles:');
      collections.forEach(col => {
        console.log(`- ${col.name}`);
      });

      // Si existe la colección tasks, contar documentos
      if (collections.some(col => col.name === 'tasks')) {
        const tasksCount = await db.collection('tasks').countDocuments();
        console.log(`\n📝 Número de tareas en la base de datos: ${tasksCount}`);
      } else {
        console.log('\n⚠️ La colección "tasks" no existe aún');
      }
    } else {
      console.log('❌ No se pudo conectar a MongoDB');
      console.log('Estado de conexión:', mongoose.connection.readyState);
    }
  } catch (error) {
    console.error('❌ Error al conectar:', error);
  } finally {
    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar la prueba
testConnection();