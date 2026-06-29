import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as taskService from '../services/task.service'
import { sendSuccess, sendSuccessEmpty, sendSuccessPaginated } from '../utils/response'
import { addSubtaskSchema, toggleSubtaskSchema } from '../schemas/task.schema'
import { BadRequestError } from '../utils/errors'

function getFamilyId(req: AuthRequest): string {
  return req.user!.familyId || ''
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await taskService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Tarea creada correctamente', 201)
  } catch (error) { next(error) }
}

export async function getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, priority, assignedTo, createdBy } = req.query
    const result = await taskService.getAll(getFamilyId(req), {
      category: category as string | undefined,
      priority: priority as string | undefined,
      assignedTo: assignedTo as string | undefined,
      createdBy: createdBy as string | undefined,
    })
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function getCompleted(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, completedBy, startDate, endDate } = req.query
    const result = await taskService.getCompleted(getFamilyId(req), {
      category: category as string | undefined,
      completedBy: completedBy as string | undefined,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    })
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await taskService.getById(req.params.id, getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await taskService.update(
      req.params.id,
      req.body,
      getFamilyId(req),
      req.user!._id,
      req.user!.familyRole || ''
    )
    sendSuccess(res, result, 'Tarea actualizada correctamente')
  } catch (error) { next(error) }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await taskService.remove(req.params.id, getFamilyId(req), req.user!._id, req.user!.familyRole || '')
    sendSuccessEmpty(res, 'Tarea eliminada correctamente')
  } catch (error) { next(error) }
}

export async function toggle(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await taskService.toggle(
      req.params.id,
      getFamilyId(req),
      req.user!._id,
      req.user!.familyRole || ''
    )
    sendSuccess(res, result, result.isCompleted ? 'Tarea completada' : 'Tarea reopened')
  } catch (error) { next(error) }
}

export async function addSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = addSubtaskSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError('Datos inválidos')

    const result = await taskService.addSubtask(
      req.params.id,
      parsed.data.label,
      getFamilyId(req),
      req.user!._id,
      req.user!.familyRole || ''
    )
    sendSuccess(res, result, 'Subtarea agregada correctamente')
  } catch (error) { next(error) }
}

export async function removeSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await taskService.removeSubtask(
      req.params.id,
      req.params.subtaskId,
      getFamilyId(req),
      req.user!._id,
      req.user!.familyRole || ''
    )
    sendSuccess(res, result, 'Subtarea eliminada correctamente')
  } catch (error) { next(error) }
}

export async function toggleSubtask(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = toggleSubtaskSchema.safeParse(req.body)
    if (!parsed.success) throw new BadRequestError('Datos inválidos')

    const result = await taskService.toggleSubtask(
      req.params.id,
      parsed.data.subtaskId,
      getFamilyId(req),
      req.user!._id,
      req.user!.familyRole || ''
    )
    sendSuccess(res, result, 'Subtarea actualizada')
  } catch (error) { next(error) }
}