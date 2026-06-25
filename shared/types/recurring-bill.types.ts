export type RecurringBillCategory =
  | 'rent'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'internet'
  | 'insurance'
  | 'subscription'
  | 'other'

export type BillFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

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

export interface RecurringBillData {
  _id: string
  familyId: string
  name: string
  amount: number
  category: string
  frequency: BillFrequency
  nextDueDate: string
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface ICreateRecurringBillRequest {
  name: string
  amount: number
  dueDay: number
  category: RecurringBillCategory
}

export type CreateRecurringBillRequest = Omit<RecurringBillData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateRecurringBillRequest = Partial<CreateRecurringBillRequest>

export interface IUpdateRecurringBillRequest {
  name?: string
  amount?: number
  dueDay?: number
  category?: RecurringBillCategory
}
