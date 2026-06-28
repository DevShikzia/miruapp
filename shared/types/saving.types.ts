import type { PaymentType } from './expense.types'

export type SavingColor =
  | '#C99A0A'
  | '#15C48C'
  | '#5B8DEF'
  | '#9B6EF3'
  | '#E05252'
  | '#E4B3E9'

export interface ISavingContribution {
  amount: number
  userId: string
  date: string
}

export interface ISaving {
  _id: string
  familyId: string
  name: string
  targetAmount: number
  currentAmount: number
  color: SavingColor
  emoji: string
  deadline: string | null
  autoSave: boolean
  autoSaveAmount: number | null
  autoSaveDay: number | null
  contributions: ISavingContribution[]
  createdAt: string
}

export interface ICreateSavingRequest {
  name: string
  targetAmount: number
  emoji?: string
  color?: SavingColor
  deadline?: string
  autoSave?: boolean
  autoSaveAmount?: number
  autoSaveDay?: number
}

export interface IContributeRequest {
  amount: number
  date?: string
}

export interface ContributionData {
  id: string
  amount: number
  date: string
}

export interface SavingData {
  _id: string
  familyId: string
  name: string
  targetAmount: number
  currentAmount: number
  color: SavingColor
  deadline: string
  description: string
  autoSave: boolean
  autoSaveAmount: number | null
  autoSaveDay: number | null
  progress: number
  contributions: ContributionData[]
  createdBy: string
  createdAt: string
}

export interface CreateSavingRequest {
  name: string
  targetAmount: number
  color?: SavingColor
  deadline: string
  description?: string
  autoSave?: boolean
  autoSaveAmount?: number
  autoSaveDay?: number
}

export interface UpdateSavingRequest {
  name?: string
  targetAmount?: number
  color?: SavingColor
  deadline?: string
  description?: string
  autoSave?: boolean
  autoSaveAmount?: number
  autoSaveDay?: number
}

export interface AddContributionRequest {
  amount: number
  date: string
  paymentType?: PaymentType
  creditCardId?: string
}
