const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa a MongoDB');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Colecciones disponibles:', collections.map(c => c.name));

    // Mostrar hasta 20 documentos de la colección 'users' para inspección rápida
    const users = await mongoose.connection.db.collection('users').find().limit(20).toArray();
    if (users.length === 0) {
      console.log('\n🔍 No hay documentos en la colección "users"');
    } else {
      console.log(`\n🔍 Documentos encontrados en 'users' (máx 20): ${users.length}`);
      users.forEach((u, i) => {
        // Mostrar sólo campos relevantes para evitar exponer contraseñas en consola
        console.log(`${i + 1}. _id: ${u._id} | username: ${u.username || u.name || ''} | email: ${u.email || ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();