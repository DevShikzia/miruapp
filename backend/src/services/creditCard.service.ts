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
  const pad = (n: number) => String(n).padStart(2, '0')

  const periodStart = new Date(refYear, refMonth, card.closingDay + 1)
  const periodEnd = new Date(refYear, refMonth + 1, card.closingDay)
  const dueDate = new Date(refYear, refMonth + 1, card.dueDay)

  const periodStartStr = `${periodStart.getFullYear()}-${pad(periodStart.getMonth() + 1)}-${pad(periodStart.getDate())}`
  const periodEndStr = `${periodEnd.getFullYear()}-${pad(periodEnd.getMonth() + 1)}-${pad(periodEnd.getDate())}`
  const dueDateStr = `${dueDate.getFullYear()}-${pad(dueDate.getMonth() + 1)}-${pad(dueDate.getDate())}`

  return { periodStartStr, periodEndStr, dueDateStr }
}

function periodToYYYYMM(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

export async function getStatement(cardId: string, familyId: string, month?: string): Promise<CardStatement> {
  const card = await CreditCardModel.findOne({ _id: cardId, familyId })
  if (!card) throw new NotFoundError('Tarjeta no encontrada')

  const now = new Date()
  const isCurrentPeriod = !month ||
    (parseInt(month.split('-')[0], 10) === now.getFullYear() &&
     parseInt(month.split('-')[1], 10) === now.getMonth() + 1)

  const year = month ? parseInt(month.split('-')[0], 10) : now.getFullYear()
  const refMonth = month ? parseInt(month.split('-')[1], 10) - 1 : now.getMonth()

  const { periodStartStr, periodEndStr, dueDateStr } = currentPeriod(card, year, refMonth)
  const currentPeriodYYYYMM = periodToYYYYMM(year, refMonth + 1)

  // Para recurring items: filtrar isActive solo en período actual
  // Para installment items: siempre mostrar (isActive no los afecta para mostrarse)
  const recurringQuery: Record<string, unknown> = { cardId, familyId, type: 'recurring' }
  if (isCurrentPeriod) {
    recurringQuery.isActive = true
  }
  const installmentQuery: Record<string, unknown> = { cardId, familyId, type: 'installment' }

  const [expenses, recurringItems, installmentItems, currentRate] = await Promise.all([
    ExpenseModel.find({
      familyId,
      creditCardId: cardId,
      date: { $gte: periodStartStr, $lte: periodEndStr },
    }).sort({ date: -1 }),
    CardItemModel.find(recurringQuery),
    CardItemModel.find(installmentQuery),
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

  for (const item of recurringItems) {
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
      isPaid: !item.isActive,
      startPeriod: item.startPeriod.toISOString(),
    })
  }

  for (const item of installmentItems) {
    const totalInst = item.totalInstallments || 1
    const current = cardItemService.getCurrentInstallment(item.startPeriod, currentPeriodYYYYMM, totalInst)
    const remaining = totalInst - (current ?? totalInst)
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
      currentInstallment: current ?? totalInst,
      remainingInstallments: Math.max(0, remaining),
      totalAmount: item.totalAmount,
      totalInstallments: item.totalInstallments,
      installmentManual: item.installmentManual,
      isPaid: !item.isActive,
      startPeriod: item.startPeriod.toISOString(),
    })
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

export interface PayStatementData {
  amount: number
  paymentMethod: 'debit' | 'cash' | 'transfer' | 'credit_card'
  sourceCardId?: string
  commission?: number
  description?: string
}

export async function payStatement(
  cardId: string,
  familyId: string,
  userId: string,
  data: PayStatementData
): Promise<void> {
  const card = await CreditCardModel.findOne({ _id: cardId, familyId })
  if (!card) throw new NotFoundError('Tarjeta no encontrada')

  const now = new Date()
  const { periodEndStr } = currentPeriod(card, now.getFullYear(), now.getMonth())

  // Solo marcar recurring como pagados. Los installment siguen activos hasta q se completen todas las cuotas
  await CardItemModel.updateMany(
    {
      cardId,
      familyId,
      isActive: true,
      type: 'recurring',
    },
    { $set: { isActive: false } }
  )

  const totalAmount = data.amount + (data.commission ?? 0)
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  if (data.paymentMethod === 'credit_card') {
    if (!data.sourceCardId) throw new NotFoundError('Tarjeta origen requerida')
    const sourceCard = await CreditCardModel.findOne({ _id: data.sourceCardId, familyId })
    if (!sourceCard) throw new NotFoundError('Tarjeta origen no encontrada')

    await CardItemModel.create({
      cardId: data.sourceCardId,
      familyId,
      createdBy: userId,
      description: data.description ?? `Pago de resumen ${card.name}`,
      category: 'other',
      type: 'recurring',
      currency: 'ARS',
      amount: totalAmount,
      isActive: false,
      startPeriod: new Date(),
    })
  } else {
    const paymentTypeMap: Record<string, 'cash' | 'debit_card' | 'transfer'> = {
      debit: 'debit_card',
      cash: 'cash',
      transfer: 'transfer',
    }

    await ExpenseModel.create({
      familyId,
      createdBy: userId,
      description: data.description ?? `Pago de resumen ${card.name}`,
      amount: totalAmount,
      category: 'other',
      date: dateStr,
      paymentType: paymentTypeMap[data.paymentMethod],
      currency: 'ARS',
      isEssential: false,
    })
  }
}
