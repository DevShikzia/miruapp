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

export interface CardStatement {
  cardId: string
  cardName: string
  periodStart: string
  periodEnd: string
  dueDate: string
  totalAmount: number
  expenses: {
    _id: string
    amount: number
    category: string
    description: string
    date: string
    createdBy: string
  }[]
}
