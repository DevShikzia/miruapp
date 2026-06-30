import { z } from 'zod'

export const createCardItemSchema = z.object({
  cardId: z.string().min(1, 'La tarjeta es requerida'),
  description: z.string().min(1, 'La descripción es requerida').max(100),
  category: z.string().min(1, 'La categoría es requerida'),
  type: z.enum(['installment', 'recurring']),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
  amount: z.number().positive('El monto debe ser positivo'),
  amountUsd: z.number().positive().optional(),
  rateUsed: z.number().positive().optional(),
  totalAmount: z.number().positive().optional(),
  totalInstallments: z.number().int().min(1).max(60).optional(),
  installmentManual: z.boolean().optional(),
  startPeriod: z.string().datetime({ message: 'Fecha inválida' }),
  paidThroughMonth: z.string().optional(),
})

export const updateCardItemSchema = z.object({
  description: z.string().min(1).max(100).optional(),
  category: z.string().optional(),
  type: z.enum(['installment', 'recurring']).optional(),
  currency: z.enum(['ARS', 'USD']).optional(),
  amount: z.number().positive().optional(),
  amountUsd: z.number().positive().optional(),
  rateUsed: z.number().positive().optional(),
  totalAmount: z.number().positive().optional(),
  totalInstallments: z.number().int().min(1).max(60).optional(),
  installmentManual: z.boolean().optional(),
  startPeriod: z.string().datetime().optional(),
  paidThroughMonth: z.string().optional(),
  isActive: z.boolean().optional(),
})
