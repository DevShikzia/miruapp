import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const createDebtSchema = z.object({
  type: z.enum(['creditor', 'debtor'], { message: 'Tipo inválido' }),
  personName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  totalAmount: z.number().positive('El monto debe ser positivo'),
  description: z.string().max(200).optional().default(''),
  dueDate: z.string().regex(dateRegex, 'Formato de fecha inválido').optional().default(''),
})

export const updateDebtSchema = z.object({
  personName: z.string().min(2).max(100).optional(),
  totalAmount: z.number().positive().optional(),
  description: z.string().max(200).optional(),
  dueDate: z.string().regex(dateRegex).optional(),
  isPaid: z.boolean().optional(),
})

export const createPaymentSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  date: z.string().regex(dateRegex, 'Formato de fecha inválido'),
  description: z.string().max(200).optional().default(''),
})

export const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  date: z.string().regex(dateRegex).optional(),
  description: z.string().max(200).optional(),
})
