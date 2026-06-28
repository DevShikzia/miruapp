export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'sale'
  | 'family'
  | 'loan'
  | 'refund'
  | 'other'

export interface IIncome {
  _id: string
  familyId: string
  userId: string
  description: string
  amount: number
  category: IncomeCategory
  date: string
  createdAt: string
}

export interface IncomeData {
  _id: string
  familyId: string
  amount: number
  category: string
  description: string
  date: string
  isRecurring: boolean
  createdBy: string
  createdByName?: string
  createdAt: string
}

export interface ICreateIncomeRequest {
  description?: string
  amount: number
  category: IncomeCategory
  date?: string
  userId?: string
}

export type CreateIncomeRequest = Omit<IncomeData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateIncomeRequest = Partial<CreateIncomeRequest>

export interface IUpdateIncomeRequest {
  description?: string
  amount?: number
  category?: IncomeCategory
  date?: string
}
