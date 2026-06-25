import { NotificationModel, INotificationDocument } from '../models/Notification.model'
import { NotFoundError } from '../utils/errors'

export async function getAll(userId: string): Promise<INotificationDocument[]> {
  return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50)
}

export async function getUnreadCount(userId: string): Promise<number> {
  return NotificationModel.countDocuments({ userId, isRead: false })
}

export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  const notif = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  )
  if (!notif) throw new NotFoundError('Notificación no encontrada')
}

export async function markAllAsRead(userId: string): Promise<void> {
  await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true })
}

export async function create(data: {
  userId: string
  type: INotificationDocument['type']
  title: string
  body: string
  data?: Record<string, unknown>
}): Promise<void> {
  await NotificationModel.create(data)
}
