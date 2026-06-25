import { UserModel, IUserDocument } from '../models/User.model'
import { hashPassword, comparePassword } from '../utils/bcrypt'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import {
  IRegisterRequest,
  ILoginRequest,
  IRegisterResponse,
  ILoginResponse,
  IRefreshTokenResponse,
  IUserPublic,
  IGoogleLoginRequest,
} from '@shared/types/auth.types'
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors'
import { OAuth2Client } from 'google-auth-library'
import { env } from '../config/env'
import crypto from 'crypto'

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID)

function toPublic(user: IUserDocument): IUserPublic {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    platformRole: user.platformRole,
    familyId: user.familyId,
    familyRole: user.familyRole,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function register(data: IRegisterRequest): Promise<IRegisterResponse> {
  const existe = await UserModel.findOne({ email: data.email.toLowerCase() })
  if (existe) throw new ConflictError('El email ya está registrado')

  const hashedPassword = await hashPassword(data.password)
  const user = await UserModel.create({
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: hashedPassword,
    platformRole: 'user',
  })

  const publicUser = toPublic(user)
  return {
    user: publicUser,
    accessToken: generateAccessToken(publicUser),
    refreshToken: generateRefreshToken(publicUser),
  }
}

export async function login(data: ILoginRequest): Promise<ILoginResponse> {
  const user = await UserModel.findOne({ email: data.email.toLowerCase() }).select('+password')
  if (!user) throw new UnauthorizedError('Email o contraseña incorrectos')

  const isValid = await comparePassword(data.password, user.password)
  if (!isValid) throw new UnauthorizedError('Email o contraseña incorrectos')

  if (!user.isActive) throw new UnauthorizedError('Cuenta desactivada')

  const publicUser = toPublic(user)
  return {
    user: publicUser,
    accessToken: generateAccessToken(publicUser),
    refreshToken: generateRefreshToken(publicUser),
  }
}

export async function refresh(token: string): Promise<IRefreshTokenResponse> {
  try {
    const decoded = verifyRefreshToken(token)
    const user = await UserModel.findById(decoded._id)
    if (!user) throw new NotFoundError('Usuario no encontrado')
    if (!user.isActive) throw new UnauthorizedError('Cuenta desactivada')

    const publicUser = toPublic(user)
    return {
      accessToken: generateAccessToken(publicUser),
      refreshToken: generateRefreshToken(publicUser),
    }
  } catch {
    throw new UnauthorizedError('Refresh token inválido o expirado')
  }
}

export async function logout(_refreshToken: string): Promise<void> {
  return
}

export async function loginWithGoogle(data: IGoogleLoginRequest): Promise<ILoginResponse> {
  const ticket = await googleClient.verifyIdToken({
    idToken: data.credential,
    audience: env.GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.email) {
    throw new UnauthorizedError('Token de Google inválido')
  }

  const googleId = payload.sub
  const email = payload.email
  const name = payload.name || email.split('@')[0]

  let user = await UserModel.findOne({
    $or: [{ googleId }, { email: email.toLowerCase() }],
  })

  if (user) {
    if (!user.googleId) {
      user.googleId = googleId
      if (!user.password) user.password = crypto.randomBytes(32).toString('hex')
      await user.save()
    }
    if (!user.isActive) throw new UnauthorizedError('Cuenta desactivada')
  } else {
    const hashedPassword = await hashPassword(crypto.randomBytes(32).toString('hex'))
    user = await UserModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      googleId,
      platformRole: 'user',
    })
  }

  const publicUser = toPublic(user)
  return {
    user: publicUser,
    accessToken: generateAccessToken(publicUser),
    refreshToken: generateRefreshToken(publicUser),
  }
}
