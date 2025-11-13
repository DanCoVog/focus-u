import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/focus-u";

if (!MONGODB_URI) {
  throw new Error("❌ No se encontró la variable MONGODB_URI en el archivo .env.local");
}

let isConnected = false;

export const connectDB = async () => {
  try {
    if (isConnected) {
      console.log("⚡ Ya estás conectado a MongoDB");
      return;
    }

    console.log("🔄 Conectando a MongoDB...");
    console.log("🔗 URI:", MONGODB_URI);

    // Conectar a MongoDB
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: "focus-u",
    });

    isConnected = !!conn.connection.readyState;

    if (isConnected) {
      console.log("✅ Conectado correctamente a MongoDB");
      console.log("📁 Base de datos activa:", conn.connection.name);

      try {
        // Acceso directo a la instancia de la base
        const db = mongoose.connection.db;

        if (!db) {
          console.warn("⚠️ No se pudo acceder directamente a la base de datos desde mongoose.connection.db");
          return;
        }

        // Listar colecciones existentes
        const collections = await db.listCollections().toArray();
        const names = collections.map((c) => c.name);
        console.log("📊 Colecciones disponibles:", names);

        // Crear colección 'tasks' si no existe
        if (!names.includes("tasks")) {
          console.log("📝 Creando colección 'tasks'...");
          await db.createCollection("tasks");
          console.log("✅ Colección 'tasks' creada exitosamente");
        } else {
          console.log("✅ Colección 'tasks' ya existe");
        }
      } catch (err) {
        console.warn("⚠️ Error al listar o crear colecciones:", err);
      }
    } else {
      throw new Error("❌ No se pudo establecer la conexión con MongoDB");
    }
  } catch (error: any) {
    console.error("🚨 Error crítico al conectar a MongoDB:", error.message);
    throw new Error(`Error al conectar a MongoDB: ${error.message}`);
  }
};
