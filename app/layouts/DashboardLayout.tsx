'use client'

import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "@/contexts/ThemeContext"
import { useZen } from "@/contexts/ZenContext"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { toast } from 'sonner'
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { isZenMode, toggleZenMode } = useZen()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Lógica de Recordatorio de Pausa Activa (cada 60 minutos de actividad)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      toast.info('🧘 ¡Pausa Activa! Has estado enfocado 60 minutos. Estira un poco tus piernas.', {
        duration: 10000,
        action: {
          label: 'Hacer estiramiento',
          onClick: () => window.open('https://www.google.com/search?q=ejercicios+estiramiento+oficina', '_blank')
        }
      });
    }, 60 * 60 * 1000); // 60 minutos

    return () => clearInterval(interval);
  }, []);

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Tareas', icon: CheckSquare, path: '/tasks' },
    { name: 'Calendario', icon: Calendar, path: '/calendar' },
    { name: 'Equipo', icon: Users, path: '/team' },
    { name: 'Configuración', icon: Settings, path: '/settings' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
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
        damping: 12,
      },
    },
  } as const

  const handleLogout = async () => {
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
  }

  return (

    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      {!isZenMode && (
        <motion.header
          className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="h-16 flex items-center justify-between px-4 md:pl-6 md:pr-6">
            <div className="flex items-center gap-3 md:hidden">
              {/* Hamburger button — mobile only */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Focus-U
              </span>
            </div>

            {/* Spacer — pushes right actions to the right on desktop (sidebar already shows logo) */}
            <div className="hidden md:block" />

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                {typeof window !== 'undefined' ? localStorage.getItem('email') || '' : ''}
              </span>
              <motion.button
                onClick={toggleZenMode}
                className="px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                title="Activar Modo Zen"
              >
                Activar Modo Zen
              </motion.button>
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:from-red-600 hover:to-red-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </motion.button>
            </div>
          </div>
        </motion.header>
      )}

      {/* Floating Exit Zen Button */}
      {isZenMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleZenMode}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={20} />
          Salir de Modo Zen
        </motion.button>
      )}

      {/* Sidebar */}
      {!isZenMode && (
        <aside
          className={`fixed top-16 bottom-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-30 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
        >

          <motion.div
            className="p-6 h-full flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* Logo — visible solo en desktop */}
            <div className="hidden md:flex items-center mb-6">
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Focus-U
              </span>
            </div>

            <motion.ul
              className="space-y-1 flex-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {menu.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <motion.li
                    key={item.name}
                    variants={itemVariants}
                  >
                    <motion.button
                      onClick={() => {
                        router.push(item.path);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all group ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 font-semibold shadow-sm'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && (
                        <motion.div
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
                          layoutId="activeIndicator"
                        />
                      )}
                    </motion.button>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* Dark Mode Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  Modo Oscuro
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  Modo Claro
                </>
              )}
            </motion.button>

          </motion.div>

        </aside>
      )}

      {/* Main Content */}
      <main className={`transition-all duration-300 ${!isZenMode ? 'pt-16 md:ml-64' : 'pt-8'}`}>
        <motion.div
          className="px-4 pt-4 pb-6 md:px-6 md:pt-5"
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