import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import { BadRequestError } from '../utils/errors'
import * as dashboardService from '../services/dashboard.service'
import * as checklistService from '../services/checklist.service'
import * as notificationService from '../services/notification.service'
import { sendSuccess, sendSuccessPaginated } from '../utils/response'

function requireFamily(user: AuthRequest['user']): string {
  if (!user?.familyId) throw new BadRequestError('Necesitás crear o unirte a una familia primero')
  return user.familyId
}

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.familyId) {
      sendSuccess(res, {
        balance: 0,
        variationPercent: 0,
        totalIncomes: 0,
        totalExpenses: 0,
        recentTransactions: [],
        debts: { active: 0, total: 0, paidPercent: 0 },
        semaforo: 'verde',
        checklist: { total: 0, completed: 0, percentage: 0, month: '', streak: 0 },
      })
      return
    }
    const data = await dashboardService.getDashboard(req.user.familyId)
    sendSuccess(res, data)
  } catch (error) { next(error) }
}

export async function getChecklist(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.familyId) {
      sendSuccess(res, { items: [], summary: { total: 0, completed: 0, percentage: 0, month: '', streak: 0 } })
      return
    }
    const month = req.query.month as string | undefined
    const data = await checklistService.getOrCreate(req.user.familyId, month)
    sendSuccess(res, data)
  } catch (error) { next(error) }
}

export async function toggleChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.params.month
    const itemId = req.params.itemId
    const data = await checklistService.toggleItem(requireFamily(req.user), month, itemId, req.user!._id)
    sendSuccess(res, data, 'Item actualizado correctamente')
  } catch (error) { next(error) }
}

export async function addChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.params.month
    const data = await checklistService.addItem(requireFamily(req.user), month, req.body, req.user!._id)
    sendSuccess(res, data, 'Tarea agregada correctamente')
  } catch (error) { next(error) }
}

export async function deleteChecklistItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const month = req.params.month
    const itemId = req.params.itemId
    const data = await checklistService.deleteItem(requireFamily(req.user), month, itemId)
    sendSuccess(res, data, 'Tarea eliminada correctamente')
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
