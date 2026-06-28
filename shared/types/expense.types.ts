export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'savings'
  | 'debt'
  | 'other'

export type PaymentType = 'cash' | 'credit_card' | 'debit_card' | 'transfer'
export type ExpenseCurrency = 'ARS' | 'USD'

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

export interface ExpenseData {
  _id: string
  familyId: string
  amount: number
  category: string
  description: string
  date: string
  paymentType: 'cash' | 'credit_card' | 'debit_card' | 'transfer'
  creditCardId?: string
  isEssential: boolean
  currency: ExpenseCurrency
  amountUsd?: number
  createdBy: string
  createdByName?: string
  createdAt: string
}

export interface ICreateExpenseRequest {
  description?: string
  amount: number
  category: ExpenseCategory
  paymentType: PaymentType
  creditCardId?: string
  date?: string
  userId?: string
  currency?: ExpenseCurrency
  amountUsd?: number
  rateUsed?: number
}

export type CreateExpenseRequest = Omit<ExpenseData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateExpenseRequest = Partial<CreateExpenseRequest>

export interface IUpdateExpenseRequest {
  description?: string
  amount?: number
  category?: ExpenseCategory
  paymentType?: PaymentType
  creditCardId?: string
  date?: string
  currency?: ExpenseCurrency
  amountUsd?: number
  rateUsed?: number
}
