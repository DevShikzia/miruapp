import mongoose from 'mongoose'
import { ChecklistModel, IChecklistDocument } from '../models/Checklist.model'
import { NotFoundError, BadRequestError } from '../utils/errors'
import type { IChecklistItem, IChecklistSummary, IChecklistResponse } from '@shared/types/checklist.types'

const DEFAULT_ITEMS: Array<{
  label: string
  amount: number | null
  dueDay: number | null
  category: string | null
}> = [
  { label: 'Pagar alquiler', amount: null, dueDay: 5, category: 'Vivienda' },
  { label: 'Pagar servicios', amount: null, dueDay: 10, category: 'Servicios' },
  { label: 'Revisar gastos del mes', amount: null, dueDay: null, category: null },
  { label: 'Actualizar ingresos del mes', amount: null, dueDay: null, category: null },
  { label: 'Aportar a metas de ahorro', amount: null, dueDay: null, category: 'Ahorro' },
]

function toChecklistItem(item: IChecklistDocument['items'][number]): IChecklistItem {
  return {
    _id: item._id.toString(),
    familyId: '',
    name: item.label,
    amount: item.amount ?? undefined,
    dueDay: item.dueDay ?? 1,
    category: item.category ?? undefined,
    assignedTo: item.assignedTo ?? undefined,
    isCompleted: item.completed,
    completedAt: item.completedAt,
    completedBy: item.completedBy,
    month: '',
    isRecurring: item.isRecurring,
    createdAt: '',
  }
}

function calcStreak(familyId: string): number {
  return 0
}

function toChecklistResponse(doc: IChecklistDocument, streak?: number): IChecklistResponse {
  const total = doc.items.length
  const completed = doc.items.filter(i => i.completed).length
  return {
    items: doc.items.map(toChecklistItem),
    summary: {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      month: doc.month,
      streak: streak ?? 0,
    },
  }
}

export async function getOrCreate(familyId: string, month?: string): Promise<IChecklistResponse> {
  const targetMonth = month || new Date().toISOString().slice(0, 7)
  const doc = await ChecklistModel.findOne({ familyId, month: targetMonth })
  if (!doc) {
    return {
      items: [],
      summary: { total: 0, completed: 0, percentage: 0, month: targetMonth, streak: 0 },
    }
  }
  const streak = await computeStreak(familyId, targetMonth)
  return toChecklistResponse(doc, streak)
}

export async function toggleItem(familyId: string, month: string, itemId: string, userId: string): Promise<IChecklistResponse> {
  const doc = await ChecklistModel.findOne({ familyId, month })
  if (!doc) throw new NotFoundError('Checklist no encontrado')

  const item = doc.items.find(i => i._id.toString() === itemId)
  if (!item) throw new NotFoundError('Item no encontrado')

  item.completed = !item.completed
  item.completedBy = item.completed ? userId : null
  item.completedAt = item.completed ? new Date().toISOString() : null
  await doc.save()

  const streak = await computeStreak(familyId, month)
  return toChecklistResponse(doc, streak)
}

export async function addItem(
  familyId: string,
  month: string,
  data: { name: string; amount?: number; dueDay?: number; category?: string },
  userId: string,
): Promise<IChecklistResponse> {
  const doc = await ChecklistModel.findOne({ familyId, month })
  if (!doc) throw new NotFoundError('Checklist no encontrado')
  if (doc.items.length >= 15) throw new BadRequestError('Máximo 15 tareas por mes')

  doc.items.push({
    _id: new mongoose.Types.ObjectId(),
    label: data.name,
    amount: data.amount ?? null,
    dueDay: data.dueDay ?? null,
    category: data.category ?? null,
    isRecurring: false,
    isCustom: true,
    assignedTo: null,
    completed: false,
    completedBy: null,
    completedAt: null,
  })
  await doc.save()

  const streak = await computeStreak(familyId, month)
  return toChecklistResponse(doc, streak)
}

export async function deleteItem(familyId: string, month: string, itemId: string): Promise<IChecklistResponse> {
  const doc = await ChecklistModel.findOne({ familyId, month })
  if (!doc) throw new NotFoundError('Checklist no encontrado')

  const idx = doc.items.findIndex(i => i._id.toString() === itemId)
  if (idx === -1) throw new NotFoundError('Item no encontrado')
  if (!doc.items[idx].isCustom) throw new BadRequestError('No podés eliminar tareas predefinidas')

  doc.items.splice(idx, 1)
  await doc.save()

  const streak = await computeStreak(familyId, month)
  return toChecklistResponse(doc, streak)
}

async function computeStreak(familyId: string, currentMonth: string): Promise<number> {
  const [year, mon] = currentMonth.split('-').map(Number)
  let streak = 0
  for (let i = 0; i < 12; i++) {
    const m = mon - i
    let targetMonth: string
    if (m <= 0) {
      targetMonth = `${year - 1}-${String(m + 12).padStart(2, '0')}`
    } else {
      targetMonth = `${year}-${String(m).padStart(2, '0')}`
    }
    const doc = await ChecklistModel.findOne({ familyId, month: targetMonth })
    if (!doc) break
    const allDone = doc.items.length > 0 && doc.items.every(item => item.completed)
    if (!allDone) break
    streak++
  }
  return streak
}
