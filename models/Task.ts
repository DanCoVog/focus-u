import mongoose, { Document } from 'mongoose';

// Interfaz para el documento de tarea
interface ITask extends Document {
  title: string;
  description?: string;
  status: 'pendiente' | 'en-progreso' | 'completada';
  priority: 'baja' | 'media' | 'alta';
  dueDate?: Date;
  tags?: string[];
  createdBy?: mongoose.Types.ObjectId;
  creatorEmail?: string;
  assignedTo?: mongoose.Types.ObjectId[];
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    minlength: [3, 'El título debe tener al menos 3 caracteres'],
    maxlength: [100, 'El título no puede exceder los 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder los 500 caracteres']
  },
  status: {
    type: String,
    enum: {
      values: ['pendiente', 'en-progreso', 'completada'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'pendiente',
    required: true
  },
  priority: {
    type: String,
    enum: {
      values: ['baja', 'media', 'alta'],
      message: '{VALUE} no es una prioridad válida'
    },
    default: 'media',
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value > new Date();
      },
      message: 'La fecha de vencimiento debe ser en el futuro'
    }
  },
  tags: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  creatorEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
}, {
  timestamps: true,
  collection: 'tasks' // Forzar el nombre de la colección
});

// Índices para mejorar el rendimiento de las consultas
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'assignedTo': 1 });

// Método para actualizar el estado de completado
taskSchema.methods.markAsComplete = function() {
  this.status = 'completada';
  this.completed = true;
  this.completedAt = new Date();
  return this.save();
};

// Virtual para calcular si la tarea está vencida
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return !this.completed && this.dueDate < new Date();
});

export default mongoose.models.Task || mongoose.model('Task', taskSchema);