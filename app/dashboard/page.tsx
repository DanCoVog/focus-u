'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import CalendarView from '../components/Calendar';

interface User {
  username: string;
  email: string;
}

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

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Intentar obtener los datos del usuario
        const storedUsername = localStorage.getItem('username');
        const storedEmail = localStorage.getItem('email');
        
        if (!storedUsername || !storedEmail) {
          throw new Error('No auth data');
        }

        setUser({
          username: storedUsername,
          email: storedEmail
        });

        // Cargar tareas desde la API
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
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Hacer la petición al endpoint de logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Limpiar localStorage y cookies
      localStorage.clear();
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redireccionar al login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error al cerrar sesión. Por favor intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (taskData: { title: string; description: string; dueDate: string; priority: 'high' | 'medium' | 'low'; category: string; status?: 'pendiente' | 'en-progreso' | 'completada' }) => {
    try {

      // Obtener email del usuario desde localStorage
      const userEmail = localStorage.getItem('email') || '';

      const apiTask = {
        title: taskData.title,
        description: taskData.description,
        dueDate: new Date(taskData.dueDate).toISOString(),
        priority: taskData.priority === 'high' ? 'alta' : taskData.priority === 'medium' ? 'media' : 'baja',
        tags: taskData.category ? [taskData.category] : [],
        status: taskData.status || 'pendiente',
        creatorEmail: userEmail
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiTask),
      });

      if (!response.ok) {
        throw new Error('Error al crear la tarea');
      }

      const { task } = await response.json();
      
      const newTask: Task = {
        id: task._id,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate || new Date().toISOString(),
        priority: task.priority === 'alta' ? 'high' : task.priority === 'media' ? 'medium' : 'low',
        category: task.tags?.[0] || '',
        completed: task.status === 'completada',
        status: task.status,
        creatorEmail: task.creatorEmail || userEmail
      };

      setTasks([...tasks, newTask]);
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      alert('Error al guardar la tarea. Por favor intente de nuevo.');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completada',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la tarea');
      }

      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, completed: true }
          : task
      ));
    } catch (error) {
      console.error('Error al completar la tarea:', error);
      alert('Error al actualizar la tarea. Por favor intente de nuevo.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la tarea');
      }

      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error al eliminar la tarea:', error);
      alert('Error al eliminar la tarea. Por favor intente de nuevo.');
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

  // Calcular contadores de tareas
  const taskStats = {
    pendientes: tasks.filter(task => task.status === 'pendiente').length,
    completadas: tasks.filter(task => task.status === 'completada').length,
    enProgreso: tasks.filter(task => task.status === 'en-progreso').length
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Widgets */}
        {[
          { title: 'Tareas Pendientes', value: taskStats.pendientes, color: 'from-blue-400 to-blue-600' },
          { title: 'Tareas Completadas', value: taskStats.completadas, color: 'from-green-400 to-green-600' },
          { title: 'En Progreso', value: taskStats.enProgreso, color: 'from-yellow-400 to-yellow-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{stat.title}</h3>
            <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Sección de tareas */}
      <motion.div 
        className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Gestión de Tareas</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cerrar' : 'Agregar Tarea'}
          </motion.button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <TaskForm onSubmit={handleAddTask} />
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Todas las tareas</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="dueDate">Ordenar por fecha</option>
              <option value="priority">Ordenar por prioridad</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {tasks.length} tareas ({tasks.filter(t => t.completed).length} completadas)
          </div>
        </div>

        {sortedTasks.length > 0 ? (
          <TaskList
            tasks={sortedTasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-500 dark:text-gray-400"
          >
            No hay tareas {filter !== 'all' ? `${filter === 'completed' ? 'completadas' : 'pendientes'}` : ''}.
            {filter === 'all' && ' ¡Agrega una tarea para comenzar!'}
          </motion.div>
        )}
      </motion.div>

      {/* Sección de Calendario */}
      <motion.div 
        className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Calendario de Tareas</h3>
        <CalendarView 
          onSelectEvent={(event) => {
            console.log('Evento seleccionado:', event);
            // Aquí puedes agregar lógica para manejar eventos seleccionados
          }}
          onSelectSlot={(slotInfo) => {
            console.log('Slot seleccionado:', slotInfo);
            setShowForm(true);
          }}
        />
      </motion.div>
    </>
  );
}
