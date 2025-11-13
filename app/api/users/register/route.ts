import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    // 🟢 Conectar a la base de datos
    await connectDB();

    // 🟠 Intentar parsear el cuerpo JSON
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "El cuerpo de la solicitud no es un JSON válido" },
        { status: 400 }
      );
    }

    const { username, email, password } = body;

    // 🔴 Validar campos requeridos
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // 🟣 Verificar si el usuario ya existe (por email o username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.email === email
              ? "El email ya está registrado"
              : "El nombre de usuario no está disponible",
        },
        { status: 400 }
      );
    }

    // 🟢 Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password, // el modelo se encarga de hashearlo
    });

    await newUser.save();

    console.log("✅ Usuario creado:", newUser.username);

    return NextResponse.json(
      {
        message: "Usuario registrado correctamente",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en registro:", error);

    // 🧠 Mensaje detallado para depurar
    return NextResponse.json(
      {
        error: "Error al registrar usuario",
        details: error?.message || "Error desconocido",
      },
      { status: 500 }
    );
  }
}
