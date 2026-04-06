'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from "../layouts/DashboardLayout";
import CalendarView from '../components/Calendar';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
  status: 'pendiente' | 'en-progreso' | 'completada';
  creatorEmail?: string;
}

export default function CalendarPage(){
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks.map((task: any) => ({
            id: task._id,
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : new Date().toISOString(),
            priority: task.priority === 'alta' ? 'high' : task.priority === 'media' ? 'medium' : 'low',
            category: task.tags?.[0] || '',
            completed: task.status === 'completada',
            status: task.status,
            creatorEmail: task.creatorEmail || ''
          })));
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    };

    loadTasks();
  }, []);

  const handleSelectEvent = (event: any) => {
    console.log('Evento seleccionado:', event);
    // Aquí puedes agregar lógica para mostrar detalles de la tarea
  };

  const handleSelectSlot = (slotInfo: any) => {
    console.log('Slot seleccionado:', slotInfo);
    setShowForm(true);
    // Aquí puedes abrir un formulario para crear tarea en esa fecha
  };

  return(
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            📅 Calendario
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Tarea
          </motion.button>
        </div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CalendarView
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </motion.div>

        {/* Estadísticas del calendario */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Tareas Esta Semana</h3>
            <p className="text-2xl font-bold text-blue-600">
              {tasks.filter(task => {
                const taskDate = new Date(task.dueDate);
                const now = new Date();
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                return taskDate >= now && taskDate <= weekFromNow;
              }).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Tareas Vencidas</h3>
            <p className="text-2xl font-bold text-red-600">
              {tasks.filter(task => new Date(task.dueDate) < new Date() && !task.completed).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Próximas Tareas</h3>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter(task => !task.completed).length}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}