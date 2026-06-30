export type CardItemType = 'installment' | 'recurring'
export type ItemCurrency = 'ARS' | 'USD'

export interface CardItem {
  _id: string
  cardId: string
  familyId: string
  createdBy: string
  description: string
  category: string
  type: CardItemType
  currency: ItemCurrency
  amount: number
  amountUsd?: number
  rateUsed?: number
  totalAmount?: number
  totalInstallments?: number
  installmentManual?: boolean
  startPeriod: string
  paidThroughMonth?: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateCardItemRequest {
  cardId: string
  description: string
  category: string
  type: CardItemType
  currency: ItemCurrency
  amount: number
  amountUsd?: number
  rateUsed?: number
  totalAmount?: number
  totalInstallments?: number
  installmentManual?: boolean
  startPeriod: string
  paidThroughMonth?: string
}

export interface UpdateCardItemRequest {
  description?: string
  category?: string
  type?: CardItemType
  currency?: ItemCurrency
  amount?: number
  amountUsd?: number
  rateUsed?: number
  totalAmount?: number
  totalInstallments?: number
  installmentManual?: boolean
  startPeriod?: string
  paidThroughMonth?: string
  isActive?: boolean
}
