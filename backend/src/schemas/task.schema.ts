import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const taskCategories = [
  'finanzas',
  'hogar',
  'supermercado',
  'salud',
  'familia',
  'personal',
  'trabajo',
  'otros',
] as const

export const taskPriorities = ['high', 'medium', 'low'] as const

export const createTaskSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  category: z.enum(taskCategories, { message: 'Categoría inválida' }),
  priority: z.enum(taskPriorities, { message: 'Prioridad inválida' }),
  dueDate: z.string().regex(dateRegex, 'Formato de fecha inválido').optional(),
  assignedTo: z.string().optional(),
  subtasks: z
    .array(
      z.object({
        label: z.string().min(1, 'El label no puede estar vacío').max(100),
      })
    )
    .max(50, 'Máximo 50 subtareas')
    .optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(taskCategories).optional(),
  priority: z.enum(taskPriorities).optional(),
  dueDate: z.string().regex(dateRegex).optional().nullable(),
  assignedTo: z.string().optional().nullable(),
})

export const addSubtaskSchema = z.object({
  label: z.string().min(1, 'El label no puede estar vacío').max(100),
})

export const toggleSubtaskSchema = z.object({
  subtaskId: z.string().min(1),
})

export const taskFiltersSchema = z.object({
  category: z.enum(taskCategories).optional(),
  priority: z.enum(taskPriorities).optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
})

export const completedFiltersSchema = z.object({
  category: z.enum(taskCategories).optional(),
  completedBy: z.string().optional(),
  startDate: z.string().regex(dateRegex).optional(),
  endDate: z.string().regex(dateRegex).optional(),
})