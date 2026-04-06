'use client'

import { useRouter } from "next/navigation"
import { useTheme } from "@/contexts/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menu = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Tareas', icon: '✅', path: '/tasks' },
    { name: 'Calendario', icon: '📅', path: '/calendar' },
    { name: 'Equipo', icon: '👥', path: '/team' },
    { name: 'Configuración', icon: '⚙️', path: '/settings' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  } as const

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  } as const

  return (

    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Focus-U
              </span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-400 hidden md:inline">
                {typeof window !== 'undefined' ? localStorage.getItem('email') || '' : ''}
              </span>
              <motion.button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', {
                      method: 'POST',
                      credentials: 'include',
                    });
                    localStorage.clear();
                    document.cookie.split(";").forEach(c => {
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });
                    router.push('/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                    router.push('/login');
                  }
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-lg hover:from-red-600 hover:to-red-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cerrar Sesión
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Sidebar */}
      <aside className="fixed md:relative md:w-64 w-64 md:translate-x-0 bg-white dark:bg-gray-900 shadow-xl h-full z-20 border-r border-gray-200 dark:border-gray-800 top-16">

        <motion.div 
          className="p-6 h-full flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >

          <motion.h1 
            className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            Focus-U
          </motion.h1>

          <motion.ul 
            className="space-y-2 flex-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {menu.map((item) => (
              <motion.li
                key={item.name}
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => router.push(item.path)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 flex gap-3 transition-colors group"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </motion.button>
              </motion.li>
            ))}
          </motion.ul>

          {/* Dark Mode Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {theme === 'light' ? '🌙 Modo Oscuro' : '☀️ Modo Claro'}
          </motion.button>

        </motion.div>

      </aside>

      {/* Contenido */}
      <main className="flex-1 md:ml-0 ml-0 pt-20">
        <motion.div
          className="p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

    </div>

  )
}