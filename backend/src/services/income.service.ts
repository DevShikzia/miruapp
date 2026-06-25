import { IncomeModel, IIncomeDocument } from '../models/Income.model'
import { CreateIncomeRequest, UpdateIncomeRequest, IncomeData } from '@shared/types/income.types'
import { NotFoundError } from '../utils/errors'

function toData(doc: IIncomeDocument): IncomeData {
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    amount: doc.amount,
    category: doc.category,
    description: doc.description,
    date: doc.date,
    isRecurring: doc.isRecurring,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateIncomeRequest, familyId: string, userId: string): Promise<IncomeData> {
  const doc = await IncomeModel.create({ ...data, familyId, createdBy: userId })
  return toData(doc)
}

export async function getAll(familyId: string, startDate?: string, endDate?: string): Promise<IncomeData[]> {
  const filter: any = { familyId }
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = startDate
    if (endDate) filter.date.$lte = endDate
  }
  const docs = await IncomeModel.find(filter).sort({ date: -1 })
  return docs.map(toData)
}

export async function getById(id: string, familyId: string): Promise<IncomeData> {
  const doc = await IncomeModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Ingreso no encontrado')
  return toData(doc)
}

export async function update(id: string, data: UpdateIncomeRequest, familyId: string): Promise<IncomeData> {
  const doc = await IncomeModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Ingreso no encontrado')
  return toData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await IncomeModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Ingreso no encontrado')
}
