'use client'

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import DashboardLayout from "../layouts/DashboardLayout"
import TaskForm from "../components/TaskForm"
import TaskList from "../components/TaskList"

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  category: string
  completed: boolean
  status: 'pendiente' | 'en-progreso' | 'completada'
}

export default function TasksPage(){

  const [tasks,setTasks] = useState<Task[]>([])
  const [showForm,setShowForm] = useState(false)
  const [filter,setFilter] = useState("all")
  const [sort,setSort] = useState("dueDate")

  useEffect(()=>{

    const loadTasks = async ()=>{

      const response = await fetch("/api/tasks")

      if(response.ok){

        const data = await response.json()

        setTasks(data.tasks.map((task:any)=>({

          id: task._id,
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate,
          priority:
            task.priority === "alta"
              ? "high"
              : task.priority === "media"
              ? "medium"
              : "low",
          category: task.tags?.[0] || "",
          completed: task.status === "completada",
          status: task.status

        })))

      }

    }

    loadTasks()

  },[])

  const handleAddTask = async(taskData:any)=>{

    const response = await fetch("/api/tasks",{

      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify(taskData)

    })

    const {task} = await response.json()

    const newTask:Task = {

      id: task._id,
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate,
      priority:
        task.priority === "alta"
          ? "high"
          : task.priority === "media"
          ? "medium"
          : "low",
      category: task.tags?.[0] || "",
      completed: task.status === "completada",
      status: task.status

    }

    setTasks([...tasks,newTask])
    setShowForm(false)

  }

  const handleCompleteTask = async(taskId:string)=>{

    await fetch(`/api/tasks?id=${taskId}`,{

      method:"PUT",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        status:"completada"
      })

    })

    setTasks(tasks.map(task=>
      task.id === taskId
        ? {...task,completed:true}
        : task
    ))

  }

  const handleDeleteTask = async(taskId:string)=>{

    await fetch(`/api/tasks?id=${taskId}`,{
      method:"DELETE"
    })

    setTasks(tasks.filter(task=>task.id !== taskId))

  }

  const filteredTasks = tasks.filter(task=>{

    if(filter === "completed") return task.completed
    if(filter === "pending") return !task.completed

    return true

  })

  const sortedTasks = [...filteredTasks].sort((a,b)=>{

    if(sort === "dueDate"){

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()

    }

    const priorityOrder = {high:0,medium:1,low:2}

    return priorityOrder[a.priority] - priorityOrder[b.priority]

  })

  return(

    <DashboardLayout>

      <div className="p-4">

        <h1 className="text-3xl font-bold mb-6">
          ✅ Gestión de Tareas
        </h1>

        <motion.button
          whileHover={{scale:1.05}}
          whileTap={{scale:0.95}}
          onClick={()=>setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6"
        >
          {showForm ? "Cerrar" : "Agregar Tarea"}
        </motion.button>

        {showForm &&(

          <div className="mb-8">

            <TaskForm onSubmit={handleAddTask}/>

          </div>

        )}

        <div className="flex gap-4 mb-6">

          <select
          value={filter}
          onChange={(e)=>setFilter(e.target.value)}
          className="border rounded p-2"
          >

            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>

          </select>

          <select
          value={sort}
          onChange={(e)=>setSort(e.target.value)}
          className="border rounded p-2"
          >

            <option value="dueDate">Por fecha</option>
            <option value="priority">Por prioridad</option>

          </select>

        </div>

        <TaskList
          tasks={sortedTasks}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
        />

      </div>

    </DashboardLayout>

  )

}