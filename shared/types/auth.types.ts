export type PlatformRole = 'superadmin' | 'agent' | 'user'
export type FamilyRole = 'family_admin' | 'member' | 'readonly'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  platformRole: PlatformRole
  familyId: string | null
  familyRole: FamilyRole | null
  isActive: boolean
  pushSubscription: object | null
  createdAt: Date
}

export interface IUserPublic {
  _id: string
  name: string
  email: string
  platformRole: PlatformRole
  familyId: string | null
  familyRole: FamilyRole | null
  isActive: boolean
  createdAt: string
}

export interface IRegisterRequest {
  name: string
  email: string
  password: string
}

export interface IRegisterResponse {
  user: IUserPublic
  accessToken: string
  refreshToken: string
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface ILoginResponse {
  user: IUserPublic
  accessToken: string
  refreshToken: string
}

export interface IRefreshTokenRequest {
  refreshToken: string
}

export interface IRefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ILogoutRequest {
  refreshToken: string
}
