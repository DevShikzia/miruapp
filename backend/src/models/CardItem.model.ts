import mongoose, { Schema, Document } from 'mongoose'

export interface ICardItemDocument extends Document {
  cardId: string
  familyId: string
  createdBy: string
  description: string
  category: string
  type: 'installment' | 'recurring'
  currency: 'ARS' | 'USD'
  amount: number
  amountUsd?: number
  rateUsed?: number
  totalAmount?: number
  totalInstallments?: number
  installmentManual?: boolean
  startPeriod: Date
  paidThroughMonth: string | null
  isActive: boolean
  createdAt: Date
}

const CardItemSchema = new Schema<ICardItemDocument>({
  cardId: { type: String, required: true, index: true },
  familyId: { type: String, required: true, index: true },
  createdBy: { type: String, required: true },
  description: { type: String, required: true, maxlength: 100 },
  category: { type: String, required: true },
  type: { type: String, enum: ['installment', 'recurring'], required: true },
  currency: { type: String, enum: ['ARS', 'USD'], default: 'ARS' },
  amount: { type: Number, required: true, min: 0.01 },
  amountUsd: { type: Number, default: undefined },
  rateUsed: { type: Number, default: undefined },
  totalAmount: { type: Number, default: undefined },
  totalInstallments: { type: Number, min: 1, max: 60 },
  installmentManual: { type: Boolean, default: undefined },
  startPeriod: { type: Date, required: true },
  paidThroughMonth: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

CardItemSchema.index({ familyId: 1, isActive: -1 })
CardItemSchema.index({ cardId: 1, isActive: -1 })
CardItemSchema.index({ cardId: 1, paidThroughMonth: 1 })

export const CardItemModel = mongoose.model<ICardItemDocument>('CardItem', CardItemSchema)
