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

export interface ICreateIncomeRequest {
  description?: string
  amount: number
  category: IncomeCategory
  date?: string
  userId?: string
}

export interface IUpdateIncomeRequest {
  description?: string
  amount?: number
  category?: IncomeCategory
  date?: string
}
