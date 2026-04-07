'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('email'));
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-lg backdrop-blur-md bg-opacity-90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Focus-U
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav
      className="bg-white dark:bg-gray-900 shadow-lg backdrop-blur-md bg-opacity-90 sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <motion.div className="flex items-center" whileHover={{ scale: 1.05 }}>
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Focus-U
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors ${
                pathname === '/' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
              }`}
            >
              Inicio
            </Link>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors ${
                  pathname === '/dashboard' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors ${
                    pathname === '/login' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className={`bg-blue-500 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:bg-blue-600 hover:shadow-lg ${
                    pathname === '/register' ? 'bg-blue-600' : ''
                  }`}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}