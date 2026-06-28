import mongoose, { Schema, Document } from 'mongoose'

export interface ICreditCardDocument extends Document {
  familyId: string
  createdBy: string
  name: string
  lastFourDigits?: string
  brand: 'visa' | 'mastercard' | 'amex' | 'other'
  closingDay: number
  dueDay: number
  creditLimit?: number
  bankName?: string
  color?: string
  notes?: string
  isActive: boolean
  createdAt: Date
}

const CreditCardSchema = new Schema<ICreditCardDocument>({
  familyId: { type: String, required: true, index: true },
  createdBy: { type: String, required: true },
  name: { type: String, required: true, maxlength: 50 },
  lastFourDigits: { type: String, maxlength: 4 },
  brand: { type: String, enum: ['visa', 'mastercard', 'amex', 'other'], required: true },
  closingDay: { type: Number, required: true, min: 1, max: 28 },
  dueDay: { type: Number, required: true, min: 1, max: 28 },
  creditLimit: { type: Number, min: 0 },
  bankName: { type: String, maxlength: 50 },
  color: { type: String, match: /^#[0-9a-fA-F]{6}$/ },
  notes: { type: String, maxlength: 200 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

CreditCardSchema.index({ familyId: 1, isActive: -1 })

export const CreditCardModel = mongoose.model<ICreditCardDocument>('CreditCard', CreditCardSchema)
