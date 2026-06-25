export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'other'

export type PaymentType = 'cash' | 'credit_card' | 'debit_card' | 'transfer'

export interface IExpense {
  _id: string
  familyId: string
  userId: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  createdAt: string
}

export interface ICreateExpenseRequest {
  description?: string
  amount: number
  category: ExpenseCategory
  paymentType: PaymentType
  date?: string
  userId?: string
}

export interface IUpdateExpenseRequest {
  description?: string
  amount?: number
  category?: ExpenseCategory
  paymentType?: PaymentType
  date?: string
}
