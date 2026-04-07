import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/focus-u";

if (!MONGODB_URI) {
  throw new Error("❌ No se encontró la variable MONGODB_URI en el archivo .env.local");
}

// Patrón de conexión cacheada recomendado para Next.js
// Evita crear múltiples conexiones en desarrollo con hot-reload
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("🔄 Conectando a MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "focus-u",
    }).then((mongooseInstance) => {
      console.log("✅ Conectado a MongoDB:", mongooseInstance.connection.name);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};
