import mongoose, { Schema, Document } from 'mongoose'

export interface IDebtDocument extends Document {
  familyId: string
  type: 'creditor' | 'debtor'
  personName: string
  totalAmount: number
  description: string
  dueDate: string
  isPaid: boolean
  installments: number
  installmentAmount: number
  interestRate: number
  payments: Array<{
    amount: number
    date: string
    description: string
  }>
  createdBy: string
  createdAt: Date
}

const DebtSchema = new Schema<IDebtDocument>({
  familyId: { type: String, required: true, index: true },
  type: { type: String, enum: ['creditor', 'debtor'], required: true },
  personName: { type: String, required: true, trim: true },
  totalAmount: { type: Number, required: true, min: 0.01 },
  description: { type: String, default: '' },
  dueDate: { type: String, default: '' },
  isPaid: { type: Boolean, default: false },
  installments: { type: Number, default: 1, min: 1, max: 36 },
  installmentAmount: { type: Number, default: 0 },
  interestRate: { type: Number, default: 0, min: 0, max: 100 },
  payments: [{
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, default: '' },
    paidBy: { type: String, default: '' },
  }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

DebtSchema.index({ familyId: 1, isPaid: 1 })

export const DebtModel = mongoose.model<IDebtDocument>('Debt', DebtSchema)
