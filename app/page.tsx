'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      // Si está autenticado, redirigir al dashboard
      router.push('/dashboard');
    }
    // Si NO está autenticado, mostrar la página principal (no hacer nada)
  }, [router]);
  
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section con Navbar */}
      <section className="bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen relative">
        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 bg-transparent z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-white">Focus-U</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="bg-white text-blue-600 px-6 py-2 rounded-md transition-all duration-200 hover:shadow-lg hover:bg-blue-50"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md border-2 border-white transition-all duration-200 hover:shadow-lg hover:bg-blue-600"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 max-w-4xl">
            Organiza tus tareas de forma inteligente
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl">
            Gestiona tu tiempo, aumenta tu productividad y alcanza tus metas con Focus-U
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            ¡Comienza Gratis!
          </Link>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#f3f4f6"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-blue-500 text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-4">Gestión de Tareas</h3>
              <p className="text-gray-600">
                Organiza y prioriza tus tareas de manera eficiente con nuestra interfaz intuitiva
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-green-500 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-4">Seguimiento</h3>
              <p className="text-gray-600">
                Visualiza tu progreso con estadísticas detalladas y reportes personalizados
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-purple-500 text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-4">Objetivos</h3>
              <p className="text-gray-600">
                Establece y alcanza tus metas personales con nuestro sistema de seguimiento
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-8">
            ¿Listo para mejorar tu productividad?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Únete a Focus-U y descubre cómo puedes transformar la manera en que gestionas tus tareas
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-md font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Crear Cuenta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Focus-U</h3>
              <p className="text-gray-400">
                Tu plataforma para la gestión inteligente de tareas
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white">
                    Iniciar Sesión
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white">
                    Registrarse
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Focus-U.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
