import { CreditCardModel, ICreditCardDocument } from '../models/CreditCard.model'
import { ExpenseModel } from '../models/Expense.model'
import { CreateCreditCardRequest, UpdateCreditCardRequest, CreditCardData, CardStatement } from '@shared/types/credit-card.types'
import { NotFoundError } from '../utils/errors'

function toData(doc: ICreditCardDocument): CreditCardData {
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    createdBy: doc.createdBy,
    name: doc.name,
    lastFourDigits: doc.lastFourDigits,
    brand: doc.brand,
    closingDay: doc.closingDay,
    dueDay: doc.dueDay,
    creditLimit: doc.creditLimit,
    bankName: doc.bankName,
    color: doc.color,
    notes: doc.notes,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateCreditCardRequest, familyId: string, userId: string): Promise<CreditCardData> {
  const doc = await CreditCardModel.create({ ...data, familyId, createdBy: userId })
  return toData(doc)
}

export async function getAll(familyId: string): Promise<CreditCardData[]> {
  const docs = await CreditCardModel.find({ familyId }).sort({ createdAt: -1 })
  return docs.map(toData)
}

export async function getById(id: string, familyId: string): Promise<CreditCardData> {
  const doc = await CreditCardModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Tarjeta no encontrada')
  return toData(doc)
}

export async function update(id: string, data: UpdateCreditCardRequest, familyId: string): Promise<CreditCardData> {
  const doc = await CreditCardModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Tarjeta no encontrada')
  return toData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await CreditCardModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Tarjeta no encontrada')
}

export async function getStatement(cardId: string, familyId: string, month?: string): Promise<CardStatement> {
  const card = await CreditCardModel.findOne({ _id: cardId, familyId })
  if (!card) throw new NotFoundError('Tarjeta no encontrada')

  const now = new Date()
  const year = month ? parseInt(month.split('-')[0], 10) : now.getFullYear()
  const refMonth = month ? parseInt(month.split('-')[1], 10) - 1 : now.getMonth()

  const periodStart = new Date(year, refMonth, card.closingDay + 1)
  const periodEnd = new Date(year, refMonth + 1, card.closingDay)

  const periodStartStr = periodStart.toISOString().slice(0, 10)
  const periodEndStr = periodEnd.toISOString().slice(0, 10)

  const dueDate = new Date(year, refMonth + 1, card.dueDay)
  const dueDateStr = dueDate.toISOString().slice(0, 10)

  const expenses = await ExpenseModel.find({
    familyId,
    creditCardId: cardId,
    date: { $gte: periodStartStr, $lte: periodEndStr },
  }).sort({ date: -1 })

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

  return {
    cardId: card._id.toString(),
    cardName: card.name,
    periodStart: periodStartStr,
    periodEnd: periodEndStr,
    dueDate: dueDateStr,
    totalAmount,
    expenses: expenses.map((e) => ({
      _id: e._id.toString(),
      amount: e.amount,
      category: e.category,
      description: e.description,
      date: e.date,
      createdBy: e.createdBy,
    })),
  }
}
