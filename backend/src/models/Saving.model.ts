import mongoose, { Schema, Document } from 'mongoose'

export interface ISavingDocument extends Document {
  familyId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string
  contributions: Array<{
    amount: number
    date: string
  }>
  createdBy: string
  createdAt: Date
}

const SavingSchema = new Schema<ISavingDocument>({
  familyId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 1 },
  currentAmount: { type: Number, default: 0, min: 0 },
  deadline: { type: String, required: true },
  description: { type: String, default: '' },
  contributions: [{
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: String, required: true },
  }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const SavingModel = mongoose.model<ISavingDocument>('Saving', SavingSchema)
