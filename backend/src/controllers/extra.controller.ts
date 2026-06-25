import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as dashboardService from '../services/dashboard.service'
import * as checklistService from '../services/checklist.service'
import * as notificationService from '../services/notification.service'
import { sendSuccess, sendSuccessPaginated } from '../utils/response'

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await dashboardService.getDashboard(req.user!.familyId!)
    sendSuccess(res, data)
  } catch (error) { next(error) }
}

export async function getChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.query.month as string | undefined
    const data = await checklistService.getOrCreate(req.user!.familyId!, month)
    sendSuccess(res, data)
  } catch (error) { next(error) }
}

export async function toggleChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.params.month
    const itemId = req.params.itemId
    const data = await checklistService.toggleItem(req.user!.familyId!, month, itemId, req.user!._id)
    sendSuccess(res, data, 'Item actualizado correctamente')
  } catch (error) { next(error) }
}

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await notificationService.getAll(req.user!._id)
    sendSuccessPaginated(res, data, data.length)
  } catch (error) { next(error) }
}

export async function getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const count = await notificationService.getUnreadCount(req.user!._id)
    sendSuccess(res, { count })
  } catch (error) { next(error) }
}

export async function markNotificationRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAsRead(req.params.id, req.user!._id)
    sendSuccess(res, null, 'Notificación marcada como leída')
  } catch (error) { next(error) }
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await notificationService.markAllAsRead(req.user!._id)
    sendSuccess(res, null, 'Todas las notificaciones marcadas como leídas')
  } catch (error) { next(error) }
}
