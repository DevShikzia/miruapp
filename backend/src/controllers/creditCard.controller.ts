import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import { BadRequestError } from '../utils/errors'
import * as creditCardService from '../services/creditCard.service'
import { sendSuccess, sendSuccessEmpty } from '../utils/response'

function requireFamily(user: AuthRequest['user']): string {
  if (!user?.familyId) throw new BadRequestError('Necesitás crear o unirte a una familia primero')
  return user.familyId
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id
    const familyId = requireFamily(req.user)
    const data = await creditCardService.create(req.body, familyId, userId)
    sendSuccess(res, data, 'Tarjeta registrada correctamente', 201)
  } catch (error) {
    next(error)
  }
}

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    const data = await creditCardService.getAll(familyId)
    sendSuccess(res, data, 'Operación exitosa')
  } catch (error) {
    next(error)
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    const data = await creditCardService.getById(req.params.id, familyId)
    sendSuccess(res, data, 'Operación exitosa')
  } catch (error) {
    next(error)
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    const data = await creditCardService.update(req.params.id, req.body, familyId)
    sendSuccess(res, data, 'Tarjeta actualizada correctamente')
  } catch (error) {
    next(error)
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    await creditCardService.remove(req.params.id, familyId)
    sendSuccessEmpty(res, 'Tarjeta eliminada correctamente')
  } catch (error) {
    next(error)
  }
}

export async function getStatement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = requireFamily(req.user)
    const month = req.query.month as string | undefined
    const data = await creditCardService.getStatement(req.params.id, familyId, month)
    sendSuccess(res, data, 'Operación exitosa')
  } catch (error) {
    next(error)
  }
}
