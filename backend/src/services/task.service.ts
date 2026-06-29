import { nanoid } from 'nanoid'
import { FilterQuery } from 'mongoose'
import { TaskModel, ITaskDocument, ITaskSubtask } from '../models/Task.model'
import { UserModel } from '../models/User.model'
import {
  TaskData,
  TaskSubtaskData,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@shared/types/task.types'
import { NotFoundError, ForbiddenError } from '../utils/errors'
import { IUserPublic } from '@shared/types/auth.types'
import { emitToFamily } from './socket.service'

interface TaskFilters {
  category?: string
  priority?: string
  assignedTo?: string
  createdBy?: string
}

interface CompletedFilters {
  category?: string
  completedBy?: string
  startDate?: string
  endDate?: string
}

async function resolveUsers(userIds: (string | null | undefined)[]): Promise<Map<string, IUserPublic>> {
  const map = new Map<string, IUserPublic>()
  const unique = [...new Set(userIds.filter((id): id is string => Boolean(id)))]
  if (unique.length === 0) return map

  const users = await UserModel.find({ _id: { $in: unique } })
    .select('_id name email createdAt')
    .lean()

  for (const u of users) {
    map.set(u._id.toString(), {
      _id: u._id.toString(),
      name: u.name || 'Usuario',
      email: u.email || '',
      platformRole: u.platformRole as any || 'user',
      familyId: u.familyId as string | null || null,
      familyRole: u.familyRole as any || null,
      isActive: u.isActive ?? true,
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    })
  }
  return map
}

function subtaskToData(subtask: ITaskSubtask, userMap: Map<string, IUserPublic>): TaskSubtaskData {
  return {
    id: subtask.id,
    label: subtask.label,
    completed: subtask.completed,
    completedBy: subtask.completedBy ? userMap.get(subtask.completedBy) || null : null,
    completedAt: subtask.completedAt,
  }
}

async function toTaskData(doc: ITaskDocument): Promise<TaskData> {
  const userIds = [
    doc.createdBy,
    doc.assignedTo,
    doc.completedBy,
    ...doc.subtasks.map(s => s.completedBy).filter(Boolean),
  ]
  const userMap = await resolveUsers(userIds)

  return {
    _id: doc._id?.toString() || '',
    familyId: doc.familyId || '',
    createdBy: userMap.get(doc.createdBy?.toString() || '') || { _id: doc.createdBy?.toString() || '', name: 'Usuario', email: '', platformRole: 'user', familyId: null, familyRole: null, isActive: true, createdAt: '' },
    assignedTo: doc.assignedTo ? (userMap.get(doc.assignedTo.toString()) || null) : null,
    title: doc.title || '',
    description: doc.description,
    category: doc.category as any,
    priority: doc.priority as any,
    dueDate: doc.dueDate,
    subtasks: doc.subtasks.map(s => subtaskToData(s, userMap)),
    isCompleted: doc.isCompleted || false,
    completedBy: doc.completedBy ? (userMap.get(doc.completedBy.toString()) || null) : null,
    completedAt: doc.completedAt,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  }
}

export async function create(data: CreateTaskRequest, familyId: string, userId: string): Promise<TaskData> {
  const subtasks = (data.subtasks || []).map(s => ({
    id: nanoid(8),
    label: s.label,
    completed: false,
    completedBy: null,
    completedAt: null,
  }))

  const doc = await TaskModel.create({
    familyId,
    createdBy: userId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    priority: data.priority,
    dueDate: data.dueDate || null,
    assignedTo: data.assignedTo || null,
    subtasks,
  })

  const result = await toTaskData(doc)
  emitToFamily(familyId, 'task:created', result)
  return result
}

export async function getAll(familyId: string, filters: TaskFilters = {}): Promise<TaskData[]> {
  const query: FilterQuery<ITaskDocument> = { familyId, isCompleted: false }

  if (filters.category) query.category = filters.category
  if (filters.priority) query.priority = filters.priority
  if (filters.assignedTo) query.assignedTo = filters.assignedTo
  if (filters.createdBy) query.createdBy = filters.createdBy

  const docs = await TaskModel.find(query).sort({ priority: 1, dueDate: 1, createdAt: 1 })
  return Promise.all(docs.map(toTaskData))
}

export async function getCompleted(familyId: string, filters: CompletedFilters = {}): Promise<TaskData[]> {
  const query: FilterQuery<ITaskDocument> = { familyId, isCompleted: true }

  if (filters.category) query.category = filters.category
  if (filters.completedBy) query.completedBy = filters.completedBy
  if (filters.startDate || filters.endDate) {
    query.completedAt = {}
    if (filters.startDate) query.completedAt.$gte = filters.startDate
    if (filters.endDate) query.completedAt.$lte = filters.endDate
  }

  const docs = await TaskModel.find(query).sort({ completedAt: -1 })
  return Promise.all(docs.map(toTaskData))
}

export async function getById(id: string, familyId: string): Promise<TaskData> {
  const doc = await TaskModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')
  return await toTaskData(doc)
}

export async function update(
  id: string,
  data: UpdateTaskRequest,
  familyId: string,
  userId: string,
  userRole: string
): Promise<TaskData> {
  const doc = await TaskModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')

  if (userRole !== 'family_admin' && doc.createdBy.toString() !== userId) {
    throw new ForbiddenError('No tenés permiso para editar esta tarea')
  }

  if (data.title !== undefined) doc.title = data.title
  if (data.description !== undefined) doc.description = data.description
  if (data.category !== undefined) doc.category = data.category
  if (data.priority !== undefined) doc.priority = data.priority
  if (data.dueDate !== undefined) doc.dueDate = data.dueDate
  if (data.assignedTo !== undefined) doc.assignedTo = data.assignedTo

  await doc.save()
  const result = await toTaskData(doc)
  emitToFamily(familyId, 'task:updated', result)
  return result
}

export async function remove(id: string, familyId: string, userId: string, userRole: string): Promise<void> {
  const doc = await TaskModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')

  if (userRole !== 'family_admin' && doc.createdBy.toString() !== userId) {
    throw new ForbiddenError('No tenés permiso para eliminar esta tarea')
  }

  await TaskModel.deleteOne({ _id: id })
  emitToFamily(familyId, 'task:deleted', { taskId: id })
}

export async function toggle(
  id: string,
  familyId: string,
  userId: string,
  userRole: string
): Promise<TaskData> {
  const doc = await TaskModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')

  if (userRole !== 'family_admin' && doc.createdBy.toString() !== userId && doc.assignedTo?.toString() !== userId) {
    throw new ForbiddenError('No tenés permiso para completar esta tarea')
  }

  doc.isCompleted = !doc.isCompleted
  if (doc.isCompleted) {
    doc.completedBy = userId
    doc.completedAt = new Date().toISOString()
  } else {
    doc.completedBy = null
    doc.completedAt = null
  }

  await doc.save()
  const result = await toTaskData(doc)
  emitToFamily(familyId, 'task:completed', result)
  return result
}

export async function addSubtask(
  taskId: string,
  label: string,
  familyId: string,
  userId: string,
  userRole: string
): Promise<TaskData> {
  const doc = await TaskModel.findOne({ _id: taskId, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')

  if (userRole !== 'family_admin' && doc.createdBy.toString() !== userId) {
    throw new ForbiddenError('No tenés permiso para agregar subtareas a esta tarea')
  }

  doc.subtasks.push({
    id: nanoid(8),
    label,
    completed: false,
    completedBy: null,
    completedAt: null,
  })

  await doc.save()
  const result = await toTaskData(doc)
  emitToFamily(familyId, 'task:subtask:updated', { taskId, subtask: result.subtasks[result.subtasks.length - 1] })
  return result
}

export async function removeSubtask(
  taskId: string,
  subtaskId: string,
  familyId: string,
  userId: string,
  userRole: string
): Promise<TaskData> {
  const doc = await TaskModel.findOne({ _id: taskId, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')

  if (userRole !== 'family_admin' && doc.createdBy.toString() !== userId) {
    throw new ForbiddenError('No tenés permiso para eliminar subtareas de esta tarea')
  }

  const idx = doc.subtasks.findIndex(s => s.id === subtaskId)
  if (idx === -1) throw new NotFoundError('Subtarea no encontrada')

  doc.subtasks.splice(idx, 1)
  await doc.save()
  const result = await toTaskData(doc)
  emitToFamily(familyId, 'task:subtask:updated', { taskId, subtask: null })
  return result
}

export async function toggleSubtask(
  taskId: string,
  subtaskId: string,
  familyId: string,
  userId: string,
  userRole: string
): Promise<TaskData> {
  const doc = await TaskModel.findOne({ _id: taskId, familyId })
  if (!doc) throw new NotFoundError('Tarea no encontrada')

  if (userRole !== 'family_admin' && doc.createdBy.toString() !== userId && doc.assignedTo?.toString() !== userId) {
    throw new ForbiddenError('No tenés permiso para editar esta tarea')
  }

  const subtask = doc.subtasks.find(s => s.id === subtaskId)
  if (!subtask) throw new NotFoundError('Subtarea no encontrada')

  subtask.completed = !subtask.completed
  if (subtask.completed) {
    subtask.completedBy = userId
    subtask.completedAt = new Date().toISOString()
  } else {
    subtask.completedBy = null
    subtask.completedAt = null
  }

  await doc.save()
  const result = await toTaskData(doc)
  const updatedSubtask = result.subtasks.find(s => s.id === subtaskId)
  emitToFamily(familyId, 'task:subtask:updated', { taskId, subtask: updatedSubtask })
  return result
}