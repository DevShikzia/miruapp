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
