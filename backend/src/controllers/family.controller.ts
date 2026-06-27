import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import { BadRequestError } from '../utils/errors'
import * as familyService from '../services/family.service'
import { sendSuccess } from '../utils/response'

function requireFamily(user: AuthRequest['user']): string {
  if (!user?.familyId) throw new BadRequestError('Necesitás crear o unirte a una familia primero')
  return user.familyId
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await familyService.createFamily(req.body, req.user!)
    sendSuccess(res, result, 'Familia creada correctamente', 201)
  } catch (error) { next(error) }
}

export async function join(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await familyService.joinByCode(req.body.inviteCode, req.user!)
    sendSuccess(res, result, 'Te uniste a la familia correctamente')
  } catch (error) { next(error) }
}

export async function invite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await familyService.inviteMember(requireFamily(req.user), req.body)
    sendSuccess(res, result, 'Invitación enviada correctamente')
  } catch (error) { next(error) }
}

export async function respondInvite(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { inviteId, accept } = req.body
    const result = await familyService.respondInvite(req.user!._id, inviteId, accept)
    sendSuccess(res, result, accept ? 'Invitación aceptada' : 'Invitación rechazada')
  } catch (error) { next(error) }
}

export async function getMyFamily(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await familyService.getMyFamily(req.user!._id)
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    const result = await familyService.removeMember(familyId, req.params.userId)
    sendSuccess(res, result, 'Miembro eliminado correctamente')
  } catch (error) { next(error) }
}

export async function getBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    const result = await familyService.getFamilyBalance(familyId, req.user!._id)
    sendSuccess(res, result)
  } catch (error) { next(error) }
}
