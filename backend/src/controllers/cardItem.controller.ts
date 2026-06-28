import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as cardItemService from '../services/cardItem.service'
import { getTarjetaRate } from '../services/rate.service'
import { sendSuccess, sendSuccessEmpty } from '../utils/response'
import { BadRequestError } from '../utils/errors'

function getFamilyId(req: AuthRequest): string {
  return req.user!.familyId || ''
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cardItemService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Item registrado correctamente', 201)
  } catch (error) { next(error) }
}

export async function getByCard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cardItemService.getByCard(req.params.cardId, getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cardItemService.getById(req.params.id, getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cardItemService.update(req.params.id, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Item actualizado correctamente')
  } catch (error) { next(error) }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await cardItemService.remove(req.params.id, getFamilyId(req))
    sendSuccessEmpty(res, 'Item eliminado correctamente')
  } catch (error) { next(error) }
}

export async function getActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await cardItemService.getActiveByFamily(getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function getRate(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rate = await getTarjetaRate()
    sendSuccess(res, { rate, moneda: 'USD', casa: 'tarjeta' })
  } catch (error) { next(error) }
}
