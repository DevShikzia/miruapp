export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'other'

export interface ICreditCard {
  _id: string
  familyId: string
  createdBy: string
  name: string
  lastFourDigits?: string
  brand: CardBrand
  closingDay: number
  dueDay: number
  creditLimit?: number
  bankName?: string
  color?: string
  notes?: string
  isActive: boolean
  createdAt: string
}

export interface CreditCardData {
  _id: string
  familyId: string
  createdBy: string
  name: string
  lastFourDigits?: string
  brand: CardBrand
  closingDay: number
  dueDay: number
  creditLimit?: number
  bankName?: string
  color?: string
  notes?: string
  isActive: boolean
  createdAt: string
}

export type CreateCreditCardRequest = Omit<CreditCardData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateCreditCardRequest = Partial<CreateCreditCardRequest>

export interface CardStatementItem {
  _id: string
  amount: number
  category: string
  description: string
  date: string
  createdBy: string
  source: 'expense' | 'card_item'
  itemType?: 'installment' | 'recurring'
  currency?: 'ARS' | 'USD'
  amountUsd?: number
  currentInstallment?: number
  remainingInstallments?: number
  needsUpdate?: boolean
  rateChange?: number
  totalAmount?: number
  totalInstallments?: number
  installmentManual?: boolean
  isPaid?: boolean
  startPeriod?: string
}

export interface CardStatement {
  cardId: string
  cardName: string
  periodStart: string
  periodEnd: string
  dueDate: string
  totalAmount: number
  expenseTotal: number
  itemsTotal: number
  items: CardStatementItem[]
  expenses: CardStatementItem[]
}

export interface DashboardCardItem {
  _id: string
  cardId: string
  cardName: string
  description: string
  amount: number
  currency: 'ARS' | 'USD'
  amountUsd?: number
  type: 'installment' | 'recurring'
  totalInstallments?: number
}
