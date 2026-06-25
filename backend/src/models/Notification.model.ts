import mongoose, { Schema, Document } from 'mongoose'

export type NotificationType = 'new_expense' | 'new_income' | 'debt_paid' | 'goal_reached' | 'invitation' | 'reminder' | 'checklist' | 'new_member'

export interface INotificationDocument extends Document {
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotificationDocument>({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['new_expense', 'new_income', 'debt_paid', 'goal_reached', 'invitation', 'reminder', 'checklist', 'new_member'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Schema.Types.Mixed, default: {} },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema)
