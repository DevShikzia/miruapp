import { ChecklistModel, IChecklistDocument } from '../models/Checklist.model'
import { NotFoundError } from '../utils/errors'

const DEFAULT_ITEMS = [
  'Pagar todas las deudas del mes',
  'Actualizar ingresos del mes',
  'Revisar gastos recurrentes',
  'Actualizar progreso de ahorros',
  'Cerrar resumen mensual',
]

export async function getOrCreate(familyId: string, month?: string): Promise<IChecklistDocument> {
  const targetMonth = month || new Date().toISOString().slice(0, 7)
  let checklist = await ChecklistModel.findOne({ familyId, month: targetMonth })
  if (!checklist) {
    checklist = await ChecklistModel.create({
      familyId,
      month: targetMonth,
      items: DEFAULT_ITEMS.map((label) => ({
        label,
        completed: false,
        completedBy: null,
        completedAt: null,
      })),
    })
  }
  return checklist
}

export async function toggleItem(familyId: string, month: string, itemId: string, userId: string): Promise<IChecklistDocument> {
  const checklist = await ChecklistModel.findOne({ familyId, month })
  if (!checklist) throw new NotFoundError('Checklist no encontrado')

  const item = checklist.items.find(i => i._id.toString() === itemId)
  if (!item) throw new NotFoundError('Item no encontrado')

  item.completed = !item.completed
  item.completedBy = item.completed ? userId : null
  item.completedAt = item.completed ? new Date().toISOString() : null
  await checklist.save()

  return checklist
}
