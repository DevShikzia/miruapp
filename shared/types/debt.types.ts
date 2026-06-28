import type { PaymentType } from './expense.types'

export type DebtType = 'fixed' | 'credit'
export type DebtDirection = 'i_owe' | 'they_owe_me'

export interface IPayment {
  _id: string
  debtId: string
  userId: string
  amount: number
  date: string
  description: string
  createdAt: string
}

export interface IDebt {
  _id: string
  familyId: string
  name: string
  direction: DebtDirection
  type: DebtType
  totalAmount: number
  remainingAmount: number
  installments: number
  installmentAmount: number
  dueDay: number
  interestRate?: number
  description?: string
  payments: string[]
  createdAt: string
}

export interface ICreateDebtRequest {
  name: string
  direction: DebtDirection
  type: DebtType
  totalAmount: number
  installments: number
  dueDay: number
  interestRate?: number
  description?: string
}

export interface IRegisterPaymentRequest {
  amount: number
  date?: string
  description?: string
}

export interface IDebtDetail {
  debt: IDebt
  payments: IPayment[]
  progress: number
}

export interface PaymentData {
  id: string
  amount: number
  date: string
  description: string
  paidBy: string
  paidByName: string
}

export interface DebtData {
  _id: string
  familyId: string
  type: 'creditor' | 'debtor'
  personName: string
  totalAmount: number
  description: string
  dueDate: string
  isPaid: boolean
  paidAmount: number
  progress: number
  payments: PaymentData[]
  installments: number
  installmentAmount: number
  interestRate: number
  createdBy: string
  createdByName: string
  createdAt: string
}

export interface CreateDebtRequest {
  type: 'creditor' | 'debtor'
  personName: string
  totalAmount: number
  description?: string
  dueDate?: string
  installments?: number
  installmentAmount?: number
  interestRate?: number
}

export interface UpdateDebtRequest {
  personName?: string
  totalAmount?: number
  description?: string
  dueDate?: string
  isPaid?: boolean
  installments?: number
  installmentAmount?: number
  interestRate?: number
}

export interface CreatePaymentRequest {
  amount: number
  date: string
  description?: string
  paidBy?: string
  paymentType?: PaymentType
  creditCardId?: string
}

export interface UpdatePaymentRequest {
  amount?: number
  date?: string
  description?: string
}
