import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.middleware'
import { sendError } from '../utils/response'
import { FamilyRole, PlatformRole } from '@shared/types/auth.types'

export function requirePlatformRole(...roles: PlatformRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.platformRole)) {
      sendError(res, 'No tenés permiso para realizar esta acción', 403)
      return
    }
    next()
  }
}

export function requireFamilyRole(...roles: FamilyRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.familyRole || !roles.includes(req.user.familyRole)) {
      sendError(res, 'No tenés permiso para realizar esta acción dentro de la familia', 403)
      return
    }
    next()
  }
}
