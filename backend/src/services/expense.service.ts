import { ExpenseModel, IExpenseDocument } from '../models/Expense.model'
import { CreateExpenseRequest, UpdateExpenseRequest, ExpenseData } from '@shared/types/expense.types'
import { NotFoundError } from '../utils/errors'

function toData(doc: IExpenseDocument): ExpenseData {
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    amount: doc.amount,
    category: doc.category,
    description: doc.description,
    date: doc.date,
    isEssential: doc.isEssential,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateExpenseRequest, familyId: string, userId: string): Promise<ExpenseData> {
  const doc = await ExpenseModel.create({ ...data, familyId, createdBy: userId })
  return toData(doc)
}

export async function getAll(familyId: string, startDate?: string, endDate?: string): Promise<ExpenseData[]> {
  const filter: any = { familyId }
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = startDate
    if (endDate) filter.date.$lte = endDate
  }
  const docs = await ExpenseModel.find(filter).sort({ date: -1 })
  return docs.map(toData)
}

export async function getById(id: string, familyId: string): Promise<ExpenseData> {
  const doc = await ExpenseModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Gasto no encontrado')
  return toData(doc)
}

export async function update(id: string, data: UpdateExpenseRequest, familyId: string): Promise<ExpenseData> {
  const doc = await ExpenseModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Gasto no encontrado')
  return toData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await ExpenseModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Gasto no encontrado')
}
