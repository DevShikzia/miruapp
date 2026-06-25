import { DebtModel, IDebtDocument } from '../models/Debt.model'
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

function toPaymentData(p: { amount: number; date: string; description: string }, index: number): PaymentData {
  return { id: index.toString(), amount: p.amount, date: p.date, description: p.description }
}

function toDebtData(doc: IDebtDocument): DebtData {
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
    payments: doc.payments.map(toPaymentData),
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateDebtRequest, familyId: string, userId: string): Promise<DebtData> {
  const doc = await DebtModel.create({ ...data, familyId, createdBy: userId })
  return toDebtData(doc)
}

export async function getAll(familyId: string, filter?: { isPaid?: boolean }): Promise<DebtData[]> {
  const query: any = { familyId }
  if (filter?.isPaid !== undefined) query.isPaid = filter.isPaid
  const docs = await DebtModel.find(query).sort({ createdAt: -1 })
  return docs.map(toDebtData)
}

export async function getById(id: string, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  return toDebtData(doc)
}

export async function update(id: string, data: UpdateDebtRequest, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  return toDebtData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await DebtModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Deuda no encontrada')
}

export async function addPayment(debtId: string, data: CreatePaymentRequest, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: debtId, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  if (doc.isPaid) throw new ConflictError('La deuda ya está pagada')

  doc.payments.push({ amount: data.amount, date: data.date, description: data.description || '' })
  const totalPaid = doc.payments.reduce((s, p) => s + p.amount, 0)
  if (totalPaid >= doc.totalAmount) doc.isPaid = true
  await doc.save()

  return toDebtData(doc)
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

  return toDebtData(doc)
}

export async function removePayment(debtId: string, paymentIndex: number, familyId: string): Promise<DebtData> {
  const doc = await DebtModel.findOne({ _id: debtId, familyId })
  if (!doc) throw new NotFoundError('Deuda no encontrada')
  if (!doc.payments[paymentIndex]) throw new NotFoundError('Pago no encontrado')

  doc.payments.splice(paymentIndex, 1)
  const totalPaid = doc.payments.reduce((s, p) => s + p.amount, 0)
  doc.isPaid = totalPaid >= doc.totalAmount && doc.payments.length > 0
  await doc.save()

  return toDebtData(doc)
}
