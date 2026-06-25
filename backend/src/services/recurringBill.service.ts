import { RecurringBillModel, IRecurringBillDocument } from '../models/RecurringBill.model'
import { CreateRecurringBillRequest, UpdateRecurringBillRequest, RecurringBillData } from '@shared/types/recurring-bill.types'
import { NotFoundError } from '../utils/errors'

function toData(doc: IRecurringBillDocument): RecurringBillData {
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    name: doc.name,
    amount: doc.amount,
    category: doc.category,
    frequency: doc.frequency,
    nextDueDate: doc.nextDueDate,
    isActive: doc.isActive,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateRecurringBillRequest, familyId: string, userId: string): Promise<RecurringBillData> {
  const doc = await RecurringBillModel.create({ ...data, familyId, createdBy: userId })
  return toData(doc)
}

export async function getAll(familyId: string): Promise<RecurringBillData[]> {
  const docs = await RecurringBillModel.find({ familyId }).sort({ nextDueDate: 1 })
  return docs.map(toData)
}

export async function getById(id: string, familyId: string): Promise<RecurringBillData> {
  const doc = await RecurringBillModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Gasto recurrente no encontrado')
  return toData(doc)
}

export async function update(id: string, data: UpdateRecurringBillRequest, familyId: string): Promise<RecurringBillData> {
  const doc = await RecurringBillModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Gasto recurrente no encontrado')
  return toData(doc)
}

export async function toggleActive(id: string, familyId: string): Promise<RecurringBillData> {
  const doc = await RecurringBillModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Gasto recurrente no encontrado')
  doc.isActive = !doc.isActive
  await doc.save()
  return toData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await RecurringBillModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Gasto recurrente no encontrado')
}
