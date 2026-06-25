export type NotificationType =
  | 'new_expense'
  | 'new_income'
  | 'debt_paid'
  | 'goal_reached'
  | 'invitation'
  | 'reminder'
  | 'checklist'
  | 'new_member'

export interface INotification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  createdAt: string
}
