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
      console.log('Creando tarea con datos:', taskData);

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      {/* Navbar */}
      <motion.nav 
        className="bg-white shadow-lg backdrop-blur-md bg-opacity-90"
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
              <span className="text-gray-600 hidden md:inline">{user?.email}</span>
              <motion.button
                onClick={handleLogout}
                disabled={isLoading}
                className={`bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:from-red-600 hover:to-red-700'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside 
          className="w-64 bg-white shadow-xl h-screen sticky top-0"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700">Bienvenido,</h2>
              <p className="text-gray-600 font-medium">{user?.username}</p>
            </div>
            <nav>
              <ul className="space-y-2">
  {[
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Tareas', icon: '✅', path: '/tasks' },
    { name: 'Calendario', icon: '📅', path: '/calendar' },
    { name: 'Equipo', icon: '👥', path: '/team' },
    { name: 'Configuración', icon: '⚙️', path: '/settings' }
  ].map((item) => (
    <motion.li
      key={item.name}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        onClick={() => router.push(item.path)}
        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center space-x-3"
      >
        <span>{item.icon}</span>
        <span>{item.name}</span>
      </button>
    </motion.li>
  ))}
</ul>
            </nav>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Widgets */}
            {[
              { title: 'Tareas Pendientes', value: taskStats.pendientes, color: 'from-blue-400 to-blue-600' },
              { title: 'Tareas Completadas', value: taskStats.completadas, color: 'from-green-400 to-green-600' },
              { title: 'En Progreso', value: taskStats.enProgreso, color: 'from-yellow-400 to-yellow-600' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{stat.title}</h3>
                <p className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Sección de tareas */}
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Gestión de Tareas</h3>
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
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Todas las tareas</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completadas</option>
                </select>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="dueDate">Ordenar por fecha</option>
                  <option value="priority">Ordenar por prioridad</option>
                </select>
              </div>
              <div className="text-sm text-gray-600">
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
                className="text-center py-8 text-gray-500"
              >
                No hay tareas {filter !== 'all' ? `${filter === 'completed' ? 'completadas' : 'pendientes'}` : ''}.
                {filter === 'all' && ' ¡Agrega una tarea para comenzar!'}
              </motion.div>
            )}
          </motion.div>

          {/* Sección de Calendario */}
          <motion.div 
            className="mt-8 bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Calendario de Tareas</h3>
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
        </main>
      </div>
    </motion.div>
  );
}
