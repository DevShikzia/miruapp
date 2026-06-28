import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const createIncomeSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  description: z.string().max(200).optional().default(''),
  date: z.string().regex(dateRegex, 'Formato de fecha inválido (YYYY-MM-DD)'),
  isRecurring: z.boolean().optional().default(false),
})

export const updateIncomeSchema = createIncomeSchema.partial()

export const createExpenseSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  description: z.string().max(200).optional().default(''),
  date: z.string().regex(dateRegex, 'Formato de fecha inválido (YYYY-MM-DD)'),
  paymentType: z.enum(['cash', 'credit_card', 'debit_card', 'transfer']).optional().default('cash'),
  creditCardId: z.string().optional(),
  isEssential: z.boolean().optional().default(false),
  currency: z.enum(['ARS', 'USD']).optional().default('ARS'),
  amountUsd: z.number().positive().optional(),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export const createRecurringBillSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  amount: z.number().positive('El monto debe ser positivo'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  nextDueDate: z.string().regex(dateRegex, 'Formato de fecha inválido (YYYY-MM-DD)'),
  isActive: z.boolean().optional().default(true),
})

export const updateRecurringBillSchema = createRecurringBillSchema.partial()

export const toggleRecurringBillSchema = z.object({})
