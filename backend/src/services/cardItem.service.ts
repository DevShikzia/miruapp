import { CardItemModel, ICardItemDocument } from '../models/CardItem.model'
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
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateCardItemRequest, familyId: string, userId: string): Promise<CardItem> {
  const doc = await CardItemModel.create({ ...data, familyId, createdBy: userId })
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
  const result = await CardItemModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Item no encontrado')
}

export function getCurrentInstallment(startPeriod: Date | string, currentPeriod: string, totalInstallments: number): number | null {
  const startDate = typeof startPeriod === 'string' ? new Date(startPeriod) : startPeriod
  const [currY, currM] = currentPeriod.split('-').map(Number)
  const startY = startDate.getFullYear()
  const startM = startDate.getMonth() + 1
  const monthsPassed = (currY - startY) * 12 + (currM - startM)
  const current = monthsPassed + 1
  if (current < 1 || current > totalInstallments) return null
  return current
}
