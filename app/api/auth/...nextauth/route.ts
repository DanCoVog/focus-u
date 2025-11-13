import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Debe ingresar correo y contraseña");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("Usuario no encontrado");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Contraseña incorrecta");

        // Retorna un objeto plano con los datos del usuario
        return {
          id: user._id.toString(),
          name: user.username, // Asegúrate que tu modelo usa `username`
          email: user.email,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name || "";
        session.user.email = token.email || "";
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
