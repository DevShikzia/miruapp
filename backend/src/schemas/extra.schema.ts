import { z } from 'zod'

export const toggleChecklistItemSchema = z.object({})

export const createChecklistItemSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(60),
  amount: z.number().positive('El monto debe ser positivo').optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  category: z.string().max(30).optional(),
})

export const deleteChecklistItemSchema = z.object({})

export const markNotificationReadSchema = z.object({})

export const markAllNotificationsReadSchema = z.object({})
