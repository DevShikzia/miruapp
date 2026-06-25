import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { IUserPublic } from '@shared/types/auth.types'
import { sendError } from '../utils/response'

export interface AuthRequest extends Request {
  user?: IUserPublic
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    sendError(res, 'Token no proporcionado', 401)
    return
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as IUserPublic
    req.user = decoded
    next()
  } catch {
    sendError(res, 'Token inválido o expirado', 401)
  }
}
