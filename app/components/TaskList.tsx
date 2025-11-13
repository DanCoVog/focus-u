'use client';

import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      case 'trabajo':
        return 'bg-blue-100 text-blue-800';
      case 'estudio':
        return 'bg-indigo-100 text-indigo-800';
      case 'proyecto':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg shadow-md transition-all ${
            task.completed ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                {task.title}
              </h3>
              <p className={`mt-1 text-sm text-gray-600 ${task.completed ? 'line-through' : ''}`}>
                {task.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(task.category)}`}>
                  {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  Vence: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(task.id)}
                className={`p-2 rounded-full ${
                  task.completed
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task.id)}
                className="p-2 rounded-full bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}