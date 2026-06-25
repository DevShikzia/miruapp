import { z } from 'zod'

export const createFamilySchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['member', 'readonly'], { message: 'Rol inválido' }),
})

export const respondInviteSchema = z.object({
  inviteId: z.string().min(1, 'ID de invitación requerido'),
  accept: z.boolean(),
})

export const joinFamilySchema = z.object({
  inviteCode: z.string().length(8, 'El código de invitación debe tener 8 caracteres'),
})
