import mongoose, { Schema, Document } from 'mongoose'

export interface ITaskSubtask {
  id: string
  label: string
  completed: boolean
  completedBy: string | null
  completedAt: string | null
}

export interface ITaskDocument extends Document {
  familyId: string
  createdBy: string
  assignedTo: string | null
  title: string
  description: string | null
  category: string
  priority: string
  dueDate: string | null
  subtasks: ITaskSubtask[]
  isCompleted: boolean
  completedBy: string | null
  completedAt: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

const TaskSubtaskSchema = new Schema<ITaskSubtask>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    completedBy: { type: String, default: null },
    completedAt: { type: String, default: null },
  },
  { _id: false }
)

const TaskSchema = new Schema<ITaskDocument>(
  {
    familyId: { type: String, required: true, index: true },
    createdBy: { type: String, required: true },
    assignedTo: { type: String, default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    category: {
      type: String,
      enum: ['finanzas', 'hogar', 'supermercado', 'salud', 'familia', 'personal', 'trabajo', 'otros'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
      default: 'medium',
    },
    dueDate: { type: String, default: null },
    subtasks: { type: [TaskSubtaskSchema], default: [] },
    isCompleted: { type: Boolean, default: false },
    completedBy: { type: String, default: null },
    completedAt: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

TaskSchema.index({ familyId: 1, isCompleted: 1 })
TaskSchema.index({ familyId: 1, category: 1 })
TaskSchema.index({ familyId: 1, priority: 1 })

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema)