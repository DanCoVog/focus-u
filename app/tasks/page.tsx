'use client'

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "../layouts/DashboardLayout"
import TaskForm from "../components/TaskForm"
import TaskList from "../components/TaskList"
import { toast } from 'sonner'
import { Task, ApiTask, mapApiTaskToTask, mapPriorityToApi } from '@/types'

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("dueDate")

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch("/api/tasks")
        if (response.ok) {
          const data = await response.json()
          setTasks(data.tasks.map((task: ApiTask) => mapApiTaskToTask(task)))
        }
      } catch (error) {
        console.error('Error loading tasks:', error)
        toast.error('Error al cargar las tareas')
      }
    }
    loadTasks()
  }, [])

  const handleAddTask = async (taskData: { title: string; description: string; dueDate: string; priority: 'high' | 'medium' | 'low'; category: string; status?: 'pendiente' | 'en-progreso' | 'completada' }) => {
    try {
      const userEmail = localStorage.getItem('email') || ''
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          dueDate: new Date(taskData.dueDate).toISOString(),
          priority: mapPriorityToApi(taskData.priority),
          tags: taskData.category ? [taskData.category] : [],
          status: taskData.status || 'pendiente',
          creatorEmail: userEmail,
        })
      })

      if (!response.ok) throw new Error('Error al crear tarea')

      const { task } = await response.json()
      setTasks([mapApiTaskToTask(task), ...tasks])
      setShowForm(false)
      toast.success('Tarea creada exitosamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al crear la tarea')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completada" })
      })
      if (!response.ok) throw new Error('Error')

      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed: true, status: 'completada' as const } : task
      ))
      toast.success('Tarea completada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al completar la tarea')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" })
      if (!response.ok) throw new Error('Error')

      setTasks(tasks.filter(task => task.id !== taskId))
      toast.success('Tarea eliminada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar la tarea')
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gestión de Tareas
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? "Cerrar" : "Agregar Tarea"}
          </motion.button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TaskForm onSubmit={handleAddTask} />
          </motion.div>
        )}

        <div className="flex flex-wrap gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2"
          >
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2"
          >
            <option value="dueDate">Por fecha</option>
            <option value="priority">Por prioridad</option>
          </select>

          <span className="text-sm text-gray-500 dark:text-gray-400 self-center ml-auto">
            {tasks.length} tareas ({tasks.filter(t => t.completed).length} completadas)
          </span>
        </div>

        {sortedTasks.length > 0 ? (
          <TaskList
            tasks={sortedTasks}
            onComplete={handleCompleteTask}
            onDelete={handleDeleteTask}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No hay tareas. ¡Agrega una para comenzar!
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}