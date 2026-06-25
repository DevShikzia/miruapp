export interface IChecklistItem {
  _id: string
  familyId: string
  name: string
  amount?: number
  dueDay: number
  category?: string
  assignedTo?: string
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null
  month: string
  isRecurring: boolean
  createdAt: string
}

export interface ICreateChecklistItemRequest {
  name: string
  amount?: number
  dueDay: number
  category?: string
  assignedTo?: string
}

export interface IChecklistSummary {
  total: number
  completed: number
  percentage: number
  month: string
  streak: number
}

export interface IChecklistResponse {
  items: IChecklistItem[]
  summary: IChecklistSummary
}
