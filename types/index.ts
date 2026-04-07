// ===== Tipos compartidos para Focus-U =====

// Tipo frontend para tareas (lo que manejan los componentes)
export interface Task {
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

// Tipo de lo que llega de la API de MongoDB
export interface ApiTask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'alta' | 'media' | 'baja';
  tags?: string[];
  status: 'pendiente' | 'en-progreso' | 'completada';
  completed?: boolean;
  creatorEmail?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Convierte una tarea de la API al formato frontend
export function mapApiTaskToTask(apiTask: ApiTask): Task {
  return {
    id: apiTask._id,
    title: apiTask.title,
    description: apiTask.description || '',
    dueDate: apiTask.dueDate
      ? new Date(apiTask.dueDate).toISOString()
      : new Date().toISOString(),
    priority:
      apiTask.priority === 'alta'
        ? 'high'
        : apiTask.priority === 'media'
        ? 'medium'
        : 'low',
    category: apiTask.tags?.[0] || '',
    completed: apiTask.status === 'completada',
    status: apiTask.status,
    creatorEmail: apiTask.creatorEmail || '',
  };
}

// Convierte prioridad frontend a API
export function mapPriorityToApi(priority: 'high' | 'medium' | 'low'): 'alta' | 'media' | 'baja' {
  return priority === 'high' ? 'alta' : priority === 'medium' ? 'media' : 'baja';
}

// Convierte prioridad API a frontend
export function mapPriorityFromApi(priority: 'alta' | 'media' | 'baja'): 'high' | 'medium' | 'low' {
  return priority === 'alta' ? 'high' : priority === 'media' ? 'medium' : 'low';
}

// Interface para usuario
export interface User {
  username: string;
  email: string;
}

// Interface para equipo
export interface TeamMember {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  owner: string;
  members: TeamMember[];
  color: string;
  isActive: boolean;
  createdAt: string;
}
