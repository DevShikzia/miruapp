import { FilterQuery } from 'mongoose'
import { ExpenseModel, IExpenseDocument } from '../models/Expense.model'
import { CreditCardModel } from '../models/CreditCard.model'
import { CreateExpenseRequest, UpdateExpenseRequest, ExpenseData } from '@shared/types/expense.types'
import { NotFoundError } from '../utils/errors'
import { UserModel } from '../models/User.model'

function toData(doc: IExpenseDocument): ExpenseData {
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    amount: doc.amount,
    category: doc.category,
    description: doc.description,
    date: doc.date,
    paymentType: doc.paymentType,
    creditCardId: doc.creditCardId,
    isEssential: doc.isEssential,
    currency: doc.currency || 'ARS',
    amountUsd: doc.amountUsd,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateExpenseRequest, familyId: string, userId: string): Promise<ExpenseData> {
  const doc = await ExpenseModel.create({ ...data, familyId, createdBy: userId })

  if (data.paymentType === 'credit_card' && data.creditCardId) {
    await CreditCardModel.findByIdAndUpdate(data.creditCardId, {
      $inc: { creditUsed: data.amount },
    })
  }

  return toData(doc)
}

export async function getAll(familyId: string, startDate?: string, endDate?: string): Promise<ExpenseData[]> {
  const filter: FilterQuery<IExpenseDocument> = { familyId }
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) filter.date.$gte = startDate
    if (endDate) filter.date.$lte = endDate
  }
  const docs = await ExpenseModel.find(filter).sort({ date: -1 })
  const data = docs.map(toData)
  const unique = [...new Set(data.map(d => d.createdBy))]
  const users = unique.length > 0
    ? await UserModel.find({ _id: { $in: unique } }).select('name').lean()
    : []
  const userMap = new Map(users.map(u => [u._id.toString(), u.name]))
  for (const d of data) {
    d.createdByName = userMap.get(d.createdBy) || d.createdBy
  }
  return data
}

export async function getById(id: string, familyId: string): Promise<ExpenseData> {
  const doc = await ExpenseModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Gasto no encontrado')
  return toData(doc)
}

export async function update(id: string, data: UpdateExpenseRequest, familyId: string): Promise<ExpenseData> {
  const oldDoc = await ExpenseModel.findOne({ _id: id, familyId })
  if (!oldDoc) throw new NotFoundError('Gasto no encontrado')

  const doc = await ExpenseModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Gasto no encontrado')

  if (oldDoc.paymentType === 'credit_card' && oldDoc.creditCardId) {
    await CreditCardModel.findByIdAndUpdate(oldDoc.creditCardId, {
      $inc: { creditUsed: -oldDoc.amount },
    })
  }
  if (doc.paymentType === 'credit_card' && doc.creditCardId) {
    await CreditCardModel.findByIdAndUpdate(doc.creditCardId, {
      $inc: { creditUsed: doc.amount },
    })
  }

  return toData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const doc = await ExpenseModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Gasto no encontrado')

  if (doc.paymentType === 'credit_card' && doc.creditCardId) {
    await CreditCardModel.findByIdAndUpdate(doc.creditCardId, {
      $inc: { creditUsed: -doc.amount },
    })
  }

  await ExpenseModel.deleteOne({ _id: id, familyId })
}
