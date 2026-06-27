import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as checklistService from '../services/checklist.service'
import { sendSuccess } from '../utils/response'

export async function getOrCreate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = req.user!.familyId!
    const month = req.query.month as string | undefined
    const result = await checklistService.getOrCreate(familyId, month)
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function toggleItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = req.user!.familyId!
    const { month, itemId } = req.params
    const result = await checklistService.toggleItem(familyId, month, itemId, req.user!._id)
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function addItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = req.user!.familyId!
    const { month } = req.params
    const result = await checklistService.addItem(familyId, month, req.body, req.user!._id)
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function deleteItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const familyId = req.user!.familyId!
    const { month, itemId } = req.params
    const result = await checklistService.deleteItem(familyId, month, itemId)
    sendSuccess(res, result)
  } catch (error) { next(error) }
}
