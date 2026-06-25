import mongoose, { Schema, Document } from 'mongoose'
import { BillFrequency } from '@shared/types/recurring-bill.types'

export interface IRecurringBillDocument extends Document {
  familyId: string
  name: string
  amount: number
  category: string
  frequency: BillFrequency
  nextDueDate: string
  isActive: boolean
  createdBy: string
  createdAt: Date
}

const RecurringBillSchema = new Schema<IRecurringBillDocument>({
  familyId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true },
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
  },
  nextDueDate: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

RecurringBillSchema.index({ familyId: 1, nextDueDate: 1 })

export const RecurringBillModel = mongoose.model<IRecurringBillDocument>('RecurringBill', RecurringBillSchema)
