import mongoose, { Schema, Document } from 'mongoose'

export interface IIncomeDocument extends Document {
  familyId: string
  amount: number
  category: string
  description: string
  date: string
  isRecurring: boolean
  createdBy: string
  createdAt: Date
}

const IncomeSchema = new Schema<IIncomeDocument>({
  familyId: { type: String, required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: String, required: true },
  isRecurring: { type: Boolean, default: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

IncomeSchema.index({ familyId: 1, date: -1 })

export const IncomeModel = mongoose.model<IIncomeDocument>('Income', IncomeSchema)
