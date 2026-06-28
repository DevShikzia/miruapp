import { CreditCardModel, ICreditCardDocument } from '../models/CreditCard.model'
import { ExpenseModel } from '../models/Expense.model'
import { CardItemModel } from '../models/CardItem.model'
import { CreateCreditCardRequest, UpdateCreditCardRequest, CreditCardData, CardStatement, CardStatementItem } from '@shared/types/credit-card.types'
import { getTarjetaRate } from './rate.service'
import * as cardItemService from './cardItem.service'
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

function currentPeriod(card: ICreditCardDocument, refYear: number, refMonth: number): { periodStartStr: string; periodEndStr: string; dueDateStr: string } {
  const periodStart = new Date(refYear, refMonth, card.closingDay + 1)
  const periodEnd = new Date(refYear, refMonth + 1, card.closingDay)

  const periodStartStr = periodStart.toISOString().slice(0, 10)
  const periodEndStr = periodEnd.toISOString().slice(0, 10)

  const dueDate = new Date(refYear, refMonth + 1, card.dueDay)
  const dueDateStr = dueDate.toISOString().slice(0, 10)

  return { periodStartStr, periodEndStr, dueDateStr }
}

function periodToYYYYMM(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export async function getStatement(cardId: string, familyId: string, month?: string): Promise<CardStatement> {
  const card = await CreditCardModel.findOne({ _id: cardId, familyId })
  if (!card) throw new NotFoundError('Tarjeta no encontrada')

  const now = new Date()
  const year = month ? parseInt(month.split('-')[0], 10) : now.getFullYear()
  const refMonth = month ? parseInt(month.split('-')[1], 10) - 1 : now.getMonth()

  const { periodStartStr, periodEndStr, dueDateStr } = currentPeriod(card, year, refMonth)
  const currentPeriodYYYYMM = periodToYYYYMM(year, refMonth + 1)

  const [expenses, cardItems, currentRate] = await Promise.all([
    ExpenseModel.find({
      familyId,
      creditCardId: cardId,
      date: { $gte: periodStartStr, $lte: periodEndStr },
    }).sort({ date: -1 }),
    CardItemModel.find({ cardId, familyId, isActive: true }),
    getTarjetaRate().catch(() => 1600),
  ])

  const expenseItems: CardStatementItem[] = expenses.map(e => ({
    _id: e._id.toString(),
    amount: e.amount,
    category: e.category,
    description: e.description,
    date: e.date,
    createdBy: e.createdBy,
    source: 'expense',
    currency: (e.currency || 'ARS') as 'ARS' | 'USD',
    amountUsd: e.amountUsd,
  }))

  const items: CardStatementItem[] = []

  for (const item of cardItems) {
    if (item.type === 'recurring') {
      let amount = item.amount
      let needsUpdate = false
      let rateChange: number | undefined
      if (item.currency === 'USD' && item.rateUsed && currentRate) {
        const diff = Math.abs((currentRate - item.rateUsed) / item.rateUsed * 100)
        needsUpdate = diff > 5
        rateChange = Math.round(diff * 10) / 10
      }
      items.push({
        _id: item._id.toString(),
        amount,
        category: item.category,
        description: item.description,
        date: periodStartStr,
        createdBy: item.createdBy,
        source: 'card_item',
        itemType: 'recurring',
        currency: item.currency as 'ARS' | 'USD',
        amountUsd: item.amountUsd,
        needsUpdate,
        rateChange,
        totalAmount: item.totalAmount,
        totalInstallments: item.totalInstallments,
        installmentManual: item.installmentManual,
      })
    } else if (item.type === 'installment') {
      const current = cardItemService.getCurrentInstallment(item.startPeriod, currentPeriodYYYYMM, item.totalInstallments || 1)
      if (current !== null) {
        const remaining = (item.totalInstallments || 1) - current
        items.push({
          _id: item._id.toString(),
          amount: item.amount,
          category: item.category,
          description: item.description,
          date: periodStartStr,
          createdBy: item.createdBy,
          source: 'card_item',
          itemType: 'installment',
          currency: item.currency as 'ARS' | 'USD',
          amountUsd: item.amountUsd,
          currentInstallment: current,
          remainingInstallments: remaining,
          totalAmount: item.totalAmount,
          totalInstallments: item.totalInstallments,
          installmentManual: item.installmentManual,
        })
      }
    }
  }

  const expenseTotal = expenseItems.reduce((s, e) => s + e.amount, 0)
  const itemsTotal = items.reduce((s, i) => s + i.amount, 0)

  return {
    cardId: card._id.toString(),
    cardName: card.name,
    periodStart: periodStartStr,
    periodEnd: periodEndStr,
    dueDate: dueDateStr,
    totalAmount: expenseTotal + itemsTotal,
    expenseTotal,
    itemsTotal,
    expenses: expenseItems,
    items,
  }
}
