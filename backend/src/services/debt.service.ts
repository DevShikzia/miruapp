import { FilterQuery } from 'mongoose'
import { DebtModel, IDebtDocument } from '../models/Debt.model'
import { ExpenseModel } from '../models/Expense.model'
import { CreditCardModel } from '../models/CreditCard.model'
import { UserModel } from '../models/User.model'
import {
  CreateDebtRequest, UpdateDebtRequest,
  CreatePaymentRequest, UpdatePaymentRequest,
  DebtData, PaymentData,
} from '@shared/types/debt.types'
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors'

function calcProgress(total: number, payments: Array<{ amount: number }>): number {
  const paid = payments.reduce((sum, p) => sum + p.amount, 0)
  return Math.min(Math.round((paid / total) * 100), 100)
}

async function resolveUserNames(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) return map
  const users = await UserModel.find({ _id: { $in: unique } }).select('name').lean()
  for (const u of users) {
    map.set(u._id.toString(), u.name)
  }
  for (const id of unique) {
    if (!map.has(id)) map.set(id, 'Usuario')
  }
  return map
}

function toPaymentData(p: { amount: number; date: string; description: string; paidBy: string }, index: number, nameMap: Map<string, string>): PaymentData {
  return {
    id: index.toString(),
    amount: p.amount,
    date: p.date,
    description: p.description,
    paidBy: p.paidBy || '',
    paidByName: p.paidBy ? (nameMap.get(p.paidBy) || 'Usuario') : '',
  }
}

async function toDebtData(doc: IDebtDocument): Promise<DebtData> {
  const userIds = [doc.createdBy, ...doc.payments.map(p => p.paidBy).filter(Boolean)]
  const nameMap = await resolveUserNames(userIds)
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    type: doc.type as 'creditor' | 'debtor',
    personName: doc.personName,
    totalAmount: doc.totalAmount,
    description: doc.description,
    dueDate: doc.dueDate,
    isPaid: doc.isPaid,
    paidAmount: doc.payments.reduce((s, p) => s + p.amount, 0),
    progress: calcProgress(doc.totalAmount, doc.payments),
    payments: doc.payments.map((p, i) => toPaymentData(p as any, i, nameMap)),
    installments: doc.installments,
    installmentAmount: doc.installmentAmount,
    interestRate: doc.interestRate,
    createdBy: doc.createdBy,
    createdByName: nameMap.get(doc.createdBy) || 'Usuario',
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateDebtRequest, familyId: string, userId: string): Promise<DebtData> {
  const doc = await DebtModel.create({ ...data, familyId, createdBy: userId })
  return await toDebtData(doc)
}

export async function getAll(familyId: string, isPaid?: string): Promise<DebtData[]> {
  const query: FilterQuery<IDebtDocument> = { familyId }
  if (isPaid !== undefined) query.isPaid = isPaid === 'true'
  const docs = await DebtModel.find(query).sort({ createdAt: -1 })
  return Promise.all(docs.map(toDebtData))
}

export async function getById(id: string, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  return await toDebtData(doc)
}

export async function update(id: string, data: UpdateDebtRequest, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  return await toDebtData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await DebtModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Deuda no encontrada')
}

export async function addPayment(debtId: string, data: CreatePaymentRequest, familyId: string, userId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: debtId, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  if (doc.isPaid) throw new ConflictError('La deuda ya está pagada')

  doc.payments.push({ amount: data.amount, date: data.date, description: data.description || '', paidBy: userId })
  const totalPaid = doc.payments.reduce((s, p) => s + p.amount, 0)
  if (totalPaid >= doc.totalAmount) doc.isPaid = true
  await doc.save()

  if (data.paymentType) {
    const expense = await ExpenseModel.create({
      amount: data.amount,
      category: 'debt',
      description: `Pago deuda: ${doc.personName}`,
      date: data.date,
      paymentType: data.paymentType,
      creditCardId: data.creditCardId,
      familyId,
      createdBy: userId,
      isEssential: false,
    })
    if (data.paymentType === 'credit_card' && data.creditCardId) {
      await CreditCardModel.findByIdAndUpdate(data.creditCardId, {
        $inc: { creditUsed: data.amount },
      })
    }
  }

  return await toDebtData(doc)
}

export async function updatePayment(debtId: string, paymentIndex: number, data: UpdatePaymentRequest, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: debtId, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  if (!doc.payments[paymentIndex]) throw new NotFoundError('Pago no encontrado')

  if (data.amount !== undefined) doc.payments[paymentIndex].amount = data.amount
  if (data.date !== undefined) doc.payments[paymentIndex].date = data.date
  if (data.description !== undefined) doc.payments[paymentIndex].description = data.description

  const totalPaid = doc.payments.reduce((s, p) => s + p.amount, 0)
  doc.isPaid = totalPaid >= doc.totalAmount
  await doc.save()

  return await toDebtData(doc)
}

export async function removePayment(debtId: string, paymentIndex: number, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: debtId, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  if (!doc.payments[paymentIndex]) throw new NotFoundError('Pago no encontrado')

  doc.payments.splice(paymentIndex, 1)
  const totalPaid = doc.payments.reduce((s, p) => s + p.amount, 0)
  doc.isPaid = totalPaid >= doc.totalAmount && doc.payments.length > 0
  await doc.save()

  return await toDebtData(doc)
}
