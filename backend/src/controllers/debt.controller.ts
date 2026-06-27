import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as debtService from '../services/debt.service'
import { sendSuccess, sendSuccessEmpty, sendSuccessPaginated } from '../utils/response'

function getFamilyId(req: AuthRequest): string {
  return req.user!.familyId || ''
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await debtService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Deuda registrada correctamente', 201)
  } catch (error) { next(error) }
}

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const isPaid = req.query.isPaid as string | undefined
    const result = await debtService.getAll(getFamilyId(req), isPaid)
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await debtService.getById(req.params.id, getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await debtService.update(req.params.id, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Deuda actualizada correctamente')
  } catch (error) { next(error) }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await debtService.remove(req.params.id, getFamilyId(req))
    sendSuccessEmpty(res, 'Deuda eliminada correctamente')
  } catch (error) { next(error) }
}

export async function addPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await debtService.addPayment(req.params.id, req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Pago registrado correctamente')
  } catch (error) { next(error) }
}

export async function updatePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const paymentIndex = parseInt(req.params.paymentIndex, 10)
    const result = await debtService.updatePayment(req.params.id, paymentIndex, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Pago actualizado correctamente')
  } catch (error) { next(error) }
}

export async function removePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const paymentIndex = parseInt(req.params.paymentIndex, 10)
    const result = await debtService.removePayment(req.params.id, paymentIndex, getFamilyId(req))
    sendSuccess(res, result, 'Pago eliminado correctamente')
  } catch (error) { next(error) }
}
