import { CardItemModel, ICardItemDocument } from '../models/CardItem.model'
import { CreditCardModel } from '../models/CreditCard.model'
import { CreateCardItemRequest, UpdateCardItemRequest, CardItem } from '@shared/types/card-item.types'
import { NotFoundError } from '../utils/errors'

function toData(doc: ICardItemDocument): CardItem {
  return {
    _id: doc._id.toString(),
    cardId: doc.cardId,
    familyId: doc.familyId,
    createdBy: doc.createdBy,
    description: doc.description,
    category: doc.category,
    type: doc.type as 'installment' | 'recurring',
    currency: doc.currency as 'ARS' | 'USD',
    amount: doc.amount,
    amountUsd: doc.amountUsd,
    rateUsed: doc.rateUsed,
    totalAmount: doc.totalAmount,
    totalInstallments: doc.totalInstallments,
    installmentManual: doc.installmentManual,
    startPeriod: doc.startPeriod instanceof Date ? doc.startPeriod.toISOString() : doc.startPeriod,
    paidThroughMonth: doc.paidThroughMonth ?? null,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
  }
}

function getCurrentMonthYYYYMM(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export async function create(data: CreateCardItemRequest, familyId: string, userId: string): Promise<CardItem> {
  const now = new Date()
  const paidThroughMonth = data.type === 'recurring' ? getCurrentMonthYYYYMM() : null

  const doc = await CardItemModel.create({
    ...data,
    familyId,
    createdBy: userId,
    paidThroughMonth,
  })

  if (data.type === 'recurring') {
    await CreditCardModel.updateOne(
      { _id: data.cardId, familyId },
      { $inc: { creditUsed: data.amount } }
    )
  }

  return toData(doc)
}

export async function getByCard(cardId: string, familyId: string): Promise<CardItem[]> {
  const docs = await CardItemModel.find({ cardId, familyId }).sort({ createdAt: -1 })
  return docs.map(toData)
}

export async function getActiveByFamily(familyId: string): Promise<CardItem[]> {
  const docs = await CardItemModel.find({ familyId, isActive: true }).sort({ createdAt: -1 })
  return docs.map(toData)
}

export async function getById(id: string, familyId: string): Promise<CardItem> {
  const doc = await CardItemModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Item no encontrado')
  return toData(doc)
}

export async function update(id: string, data: UpdateCardItemRequest, familyId: string): Promise<CardItem> {
  const doc = await CardItemModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Item no encontrado')
  return toData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const item = await CardItemModel.findOne({ _id: id, familyId })
  if (!item) throw new NotFoundError('Item no encontrado')

  if (item.type === 'recurring') {
    await CreditCardModel.updateOne(
      { _id: item.cardId, familyId },
      { $inc: { creditUsed: -item.amount } }
    )
  }

  await CardItemModel.deleteOne({ _id: id, familyId })
}

export function getCurrentInstallment(startPeriod: Date | string, currentPeriod: string, totalInstallments: number, closingDay: number = 1): number | null {
  const startStr = typeof startPeriod === 'string' ? startPeriod : startPeriod.toISOString()
  const startDate = new Date(startStr)
  const startDay = startDate.getUTCDate()
  const startY = startDate.getUTCFullYear()
  const startM = startDate.getUTCMonth() + 1

  let startCycleY = startY
  let startCycleM = startM
  if (startDay > closingDay) {
    startCycleM = startM + 1
    if (startCycleM > 12) {
      startCycleM = 1
      startCycleY = startY + 1
    }
  } else {
    startCycleM = startM
  }

  const [currY, currM] = currentPeriod.split('-').map(Number)
  const monthsPassed = (currY - startCycleY) * 12 + (currM - startCycleM)
  const current = monthsPassed + 1
  if (current < 1 || current > totalInstallments) return null
  return current
}
