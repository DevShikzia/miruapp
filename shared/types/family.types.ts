import { IUserPublic } from './auth.types'

export interface IFamily {
  _id: string
  name: string
  adminId: string
  members: string[]
  inviteCode: string
  createdAt: Date
}

export interface ICreateFamilyRequest {
  name: string
}

export interface ICreateFamilyResponse {
  family: IFamily
}

export interface IJoinFamilyRequest {
  inviteCode: string
}

export interface IMember {
  userId: IUserPublic
  role: import('./auth.types').FamilyRole
  joinedAt: string
}

export interface IFamilyBalance {
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export interface IFamilyDetail {
  family: IFamily
  members: IMember[]
  balance: IFamilyBalance
}
