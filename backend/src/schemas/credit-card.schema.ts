import { z } from 'zod'

const hexColorRegex = /^#[0-9a-fA-F]{6}$/

export const createCreditCardSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  brand: z.enum(['visa', 'mastercard', 'amex', 'other']),
  closingDay: z.number().int().min(1, 'El día de cierre debe ser entre 1 y 28').max(28, 'El día de cierre debe ser entre 1 y 28'),
  dueDay: z.number().int().min(1, 'El día de vencimiento debe ser entre 1 y 28').max(28, 'El día de vencimiento debe ser entre 1 y 28'),
  lastFourDigits: z.string().regex(/^\d{4}$/, 'Deben ser 4 dígitos').optional(),
  creditLimit: z.number().positive('El límite debe ser positivo').optional(),
  bankName: z.string().max(50).optional(),
  color: z.string().regex(hexColorRegex, 'Color inválido (formato #RRGGBB)').optional(),
  notes: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
})

export const updateCreditCardSchema = createCreditCardSchema.partial()

export const payStatementSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  paymentMethod: z.enum(['debit', 'cash', 'transfer', 'credit_card']),
  sourceCardId: z.string().optional(),
  commission: z.number().nonnegative().optional(),
  description: z.string().max(200).optional(),
})
