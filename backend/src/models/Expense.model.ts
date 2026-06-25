import mongoose, { Schema, Document } from 'mongoose'

export interface IExpenseDocument extends Document {
  familyId: string
  amount: number
  category: string
  description: string
  date: string
  paymentType: 'cash' | 'credit_card' | 'debit_card' | 'transfer'
  isEssential: boolean
  createdBy: string
  createdAt: Date
}

const ExpenseSchema = new Schema<IExpenseDocument>({
  familyId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String, required: true },
  paymentType: { type: String, enum: ['cash', 'credit_card', 'debit_card', 'transfer'], default: 'cash' },
  isEssential: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

ExpenseSchema.index({ familyId: 1, date: -1 })

export const ExpenseModel = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema)
