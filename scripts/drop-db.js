const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function dropDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI no definido en .env.local');

    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`Conectado a la base de datos: ${dbName}`);

    // Confirmación simple antes de borrar
    console.log('⚠️ Se procederá a borrar la base de datos. Esto eliminará todas las colecciones y documentos.');

    // Ejecutar dropDatabase
    await db.dropDatabase();
    console.log('✅ Base de datos borrada correctamente.');

    // Listar colecciones para verificar
    const collections = await db.listCollections().toArray();
    console.log('Colecciones tras drop:', collections.map(c => c.name));

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

// Ejecutar
dropDatabase();
