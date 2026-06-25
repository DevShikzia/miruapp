import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as savingService from '../services/saving.service'
import { sendSuccess, sendSuccessEmpty, sendSuccessPaginated } from '../utils/response'

function getFamilyId(req: AuthRequest): string { return req.user!.familyId || '' }

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savingService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Meta de ahorro creada correctamente', 201)
  } catch (error) { next(error) }
}

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savingService.getAll(getFamilyId(req))
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savingService.getById(req.params.id, getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savingService.update(req.params.id, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Meta actualizada correctamente')
  } catch (error) { next(error) }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await savingService.remove(req.params.id, getFamilyId(req))
    sendSuccessEmpty(res, 'Meta eliminada correctamente')
  } catch (error) { next(error) }
}

export async function addContribution(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savingService.addContribution(req.params.id, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Contribución registrada correctamente')
  } catch (error) { next(error) }
}

export async function removeContribution(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const index = parseInt(req.params.contributionIndex, 10)
    const result = await savingService.removeContribution(req.params.id, index, getFamilyId(req))
    sendSuccess(res, result, 'Contribución eliminada correctamente')
  } catch (error) { next(error) }
}
