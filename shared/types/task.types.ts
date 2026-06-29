import { IUserPublic } from './auth.types'

export type TaskCategory =
  | 'finanzas'
  | 'hogar'
  | 'supermercado'
  | 'salud'
  | 'familia'
  | 'personal'
  | 'trabajo'
  | 'otros'

export type TaskPriority = 'high' | 'medium' | 'low'

export interface TaskSubtask {
  id: string
  label: string
  completed: boolean
  completedBy: string | null
  completedAt: string | null
}

export interface Task {
  _id: string
  familyId: string
  createdBy: string
  assignedTo: string | null
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  dueDate: string | null
  subtasks: TaskSubtask[]
  isCompleted: boolean
  completedBy: string | null
  completedAt: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TaskSubtaskData {
  id: string
  label: string
  completed: boolean
  completedBy: IUserPublic | null
  completedAt: string | null
}

export interface TaskData {
  _id: string
  familyId: string
  createdBy: IUserPublic
  assignedTo: IUserPublic | null
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  dueDate: string | null
  subtasks: TaskSubtaskData[]
  isCompleted: boolean
  completedBy: IUserPublic | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string
  assignedTo?: string
  subtasks?: { label: string }[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  dueDate?: string | null
  assignedTo?: string | null
}

export interface ToggleSubtaskRequest {
  subtaskId: string
}

export const TASK_CATEGORIES = {
  finanzas: { label: 'Finanzas', icon: '💰' },
  hogar: { label: 'Hogar', icon: '🏠' },
  supermercado: { label: 'Supermercado', icon: '🛒' },
  salud: { label: 'Salud', icon: '💊' },
  familia: { label: 'Familia', icon: '👨‍👩‍👧' },
  personal: { label: 'Personal', icon: '👤' },
  trabajo: { label: 'Trabajo', icon: '💼' },
  otros: { label: 'Otros', icon: '📌' }
} as const

export const TASK_PRIORITIES = {
  high: { label: 'Alta', color: '#E05252' },
  medium: { label: 'Media', color: '#C99A0A' },
  low: { label: 'Baja', color: '#15C48C' }
} as const