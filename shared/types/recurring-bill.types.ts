export type RecurringBillCategory =
  | 'rent'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'internet'
  | 'insurance'
  | 'subscription'
  | 'other'

export interface IRecurringBill {
  _id: string
  familyId: string
  name: string
  amount: number
  dueDay: number
  category: RecurringBillCategory
  isPaid: boolean
  paidAt: string | null
  paidBy: string | null
  recurring: true
  createdAt: string
}

export interface ICreateRecurringBillRequest {
  name: string
  amount: number
  dueDay: number
  category: RecurringBillCategory
}

export interface IUpdateRecurringBillRequest {
  name?: string
  amount?: number
  dueDay?: number
  category?: RecurringBillCategory
}
