import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IChecklistDocument extends Document {
  familyId: string
  month: string
  items: Array<{
    _id: Types.ObjectId
    label: string
    amount: number | null
    dueDay: number | null
    category: string | null
    isRecurring: boolean
    isCustom: boolean
    assignedTo: string | null
    completed: boolean
    completedBy: string | null
    completedAt: string | null
  }>
  createdAt: Date
  updatedAt: Date
}

const ChecklistSchema = new Schema<IChecklistDocument>({
  familyId: { type: String, required: true, index: true },
  month: { type: String, required: true },
  items: [{
    label: { type: String, required: true },
    amount: { type: Number, default: null },
    dueDay: { type: Number, default: null },
    category: { type: String, default: null },
    isRecurring: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
    assignedTo: { type: String, default: null },
    completed: { type: Boolean, default: false },
    completedBy: { type: String, default: null },
    completedAt: { type: String, default: null },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

ChecklistSchema.index({ familyId: 1, month: 1 }, { unique: true })

export const ChecklistModel = mongoose.model<IChecklistDocument>('Checklist', ChecklistSchema)
