import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido')

export const createSavingSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  targetAmount: z.number().min(1, 'El objetivo debe ser al menos 1'),
  color: hexColor.optional(),
  deadline: z.string().regex(dateRegex, 'Formato de fecha inválido'),
  description: z.string().max(200).optional().default(''),
  autoSave: z.boolean().optional(),
  autoSaveAmount: z.number().positive('El monto debe ser positivo').optional(),
  autoSaveDay: z.number().int().min(1).max(28).optional(),
})

export const updateSavingSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  targetAmount: z.number().min(1).optional(),
  color: hexColor.optional(),
  deadline: z.string().regex(dateRegex).optional(),
  description: z.string().max(200).optional(),
  autoSave: z.boolean().optional(),
  autoSaveAmount: z.number().positive().optional(),
  autoSaveDay: z.number().int().min(1).max(28).optional(),
})

export const addContributionSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  date: z.string().regex(dateRegex, 'Formato de fecha inválido'),
  paymentType: z.enum(['cash', 'credit_card', 'debit_card', 'transfer']).optional(),
  creditCardId: z.string().optional(),
})
