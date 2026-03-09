'use client'

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const router = useRouter()

  const menu = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Tareas', icon: '✅', path: '/tasks' },
    { name: 'Calendario', icon: '📅', path: '/calendar' },
    { name: 'Equipo', icon: '👥', path: '/team' },
    { name: 'Configuración', icon: '⚙️', path: '/settings' }
  ]

  return (

    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl">

        <div className="p-6">

          <h1 className="text-2xl font-bold mb-8 text-blue-600">
            Focus-U
          </h1>

          <ul className="space-y-2">

            {menu.map((item) => (

              <motion.li
                key={item.name}
                whileHover={{ scale: 1.03 }}
              >

                <button
                  onClick={() => router.push(item.path)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 flex gap-3"
                >

                  <span>{item.icon}</span>
                  <span>{item.name}</span>

                </button>

              </motion.li>

            ))}

          </ul>

        </div>

      </aside>

      {/* Contenido */}
      <main className="flex-1 p-8">

        {children}

      </main>

    </div>

  )
}