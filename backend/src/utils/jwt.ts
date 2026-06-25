import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { IUserPublic } from '@shared/types/auth.types'

export function generateAccessToken(user: IUserPublic): string {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      platformRole: user.platformRole,
      familyId: user.familyId,
      familyRole: user.familyRole,
      isActive: user.isActive,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRATION as string & jwt.SignOptions['expiresIn'] }
  )
}

export function generateRefreshToken(user: IUserPublic): string {
  return jwt.sign(
    { _id: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRATION as string & jwt.SignOptions['expiresIn'] }
  )
}

export function verifyRefreshToken(token: string): { _id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { _id: string }
}
