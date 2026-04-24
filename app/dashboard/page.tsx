'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import CalendarView from '../components/Calendar';
import FocusTimer from '../components/FocusTimer';
import AmbientSounds from '../components/AmbientSounds';
import ProductivityHeatmap from '../components/ProductivityHeatmap';
import WeeklyReport from '../components/WeeklyReport';
import { toast } from 'sonner';
import { Task, ApiTask, mapApiTaskToTask, mapPriorityToApi } from '@/types';
import type { User } from '@/types';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [calendarKey, setCalendarKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');

        if (!storedUsername || !storedEmail) {
          throw new Error('No auth data');
        }

        setUser({ username: storedUsername, email: storedEmail });

        const response = await fetch('/api/tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks.map((task: ApiTask) => mapApiTaskToTask(task)));
        } else if (response.status === 401) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleAddTask = async (taskData: { title: string; description: string; dueDate: string; priority: 'high' | 'medium' | 'low'; category: string; status?: 'pendiente' | 'en-progreso' | 'completada' }) => {
    try {
      const userEmail = localStorage.getItem('email') || '';

      const apiTask = {
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate).toISOString(),
        priority: mapPriorityToApi(taskData.priority),
        tags: taskData.category ? [taskData.category] : [],
        status: taskData.status || 'pendiente',
        creatorEmail: userEmail,
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiTask),
      });

      if (!response.ok) throw new Error('Error al crear la tarea');

      const { task } = await response.json();
      setTasks([mapApiTaskToTask(task), ...tasks]);
      setShowForm(false);
      setCalendarKey(prev => prev + 1);
      toast.success('Tarea creada exitosamente');
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      toast.error('Error al guardar la tarea. Intenta de nuevo.');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completada' }),
      });

      if (!response.ok) throw new Error('Error al actualizar la tarea');

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed: true, status: 'completada' as const } : task
      ));
      setCalendarKey(prev => prev + 1);
      toast.success('Tarea completada');
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      toast.error('Error al actualizar la tarea.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar la tarea');

      setTasks(tasks.filter(task => task.id !== taskId));
      setCalendarKey(prev => prev + 1);
      toast.success('Tarea eliminada');
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      toast.error('Error al eliminar la tarea.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      default:
        return 0;
    }
  });

  const taskStats = {
    pendientes: tasks.filter(task => task.status === 'pendiente').length,
    completadas: tasks.filter(task => task.status === 'completada').length,
    enProgreso: tasks.filter(task => task.status === 'en-progreso').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">¡Hola {user?.username || 'Usuario'}!</h1>
              <p className="text-sm text-blue-100 mt-1">
                Tienes <span className="font-bold">{taskStats.pendientes}</span> tareas pendientes para hoy.
              </p>
            </div>
            <div className="inline-flex gap-3">
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
                {tasks.length} tareas totales
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white">
                {taskStats.completadas} completadas
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 xl:grid-cols-[2.2fr_1fr]">
          <div className="flex flex-col gap-4 h-full">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Pendientes', value: taskStats.pendientes, color: 'from-blue-400 to-blue-600' },
                { label: 'Completadas', value: taskStats.completadas, color: 'from-green-400 to-green-600' },
                { label: 'En progreso', value: taskStats.enProgreso, color: 'from-yellow-400 to-yellow-600' },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  className="rounded-3xl bg-white dark:bg-gray-800 p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-3">{card.label}</p>
                  <p className={`text-4xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                    {card.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="flex-1 flex flex-col rounded-3xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestión de tareas</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Filtra, ordena y administra tus tareas desde aquí.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
                >
                  {showForm ? 'Cerrar formulario' : 'Agregar tarea'}
                </motion.button>
              </div>

              {showForm && (
                <motion.div
                  className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-900/60"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TaskForm onSubmit={handleAddTask} />
                </motion.div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">Todas</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completadas</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="dueDate">Por fecha</option>
                  <option value="priority">Por prioridad</option>
                </select>
              </div>

              {sortedTasks.length > 0 ? (
                <div className="mt-6 space-y-4">
                  <TaskList
                    tasks={sortedTasks}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                  />
                </div>
              ) : (
                <div className="mt-6 flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400">
                  {filter === 'all'
                    ? 'No hay tareas aún. Agrega una para comenzar.'
                    : 'No hay tareas que coincidan con el filtro actual.'}
                </div>
              )}
            </motion.div>
          </div>

          <div className="flex flex-col gap-4 h-full">
            <FocusTimer />
            <AmbientSounds />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ProductivityHeatmap />
          <WeeklyReport />
        </div>
      </div>
    </DashboardLayout>
  );
}
