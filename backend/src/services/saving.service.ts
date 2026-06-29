import { SavingModel, ISavingDocument } from '../models/Saving.model'
import { ExpenseModel } from '../models/Expense.model'
import {
  CreateSavingRequest, UpdateSavingRequest,
  AddContributionRequest,
  SavingData, ContributionData,
  SavingColor,
} from '@shared/types/saving.types'
import { NotFoundError, BadRequestError } from '../utils/errors'

function toContributionData(c: { amount: number; date: string }, index: number): ContributionData {
  return { id: index.toString(), amount: c.amount, date: c.date }
}

function calcProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

function toSavingData(doc: ISavingDocument): SavingData {
  const current = doc.contributions.reduce((s, c) => s + c.amount, 0)
  return {
    _id: doc._id.toString(),
    familyId: doc.familyId,
    name: doc.name,
    targetAmount: doc.targetAmount,
    currentAmount: current,
    color: (doc.color || '#C99A0A') as SavingColor,
    deadline: doc.deadline,
    description: doc.description,
    autoSave: doc.autoSave ?? false,
    autoSaveAmount: doc.autoSaveAmount ?? null,
    autoSaveDay: doc.autoSaveDay ?? null,
    progress: calcProgress(current, doc.targetAmount),
    contributions: doc.contributions.map(toContributionData),
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
  }
}

export async function create(data: CreateSavingRequest, familyId: string, userId: string): Promise<SavingData> {
  const doc = await SavingModel.create({ ...data, familyId, currentAmount: 0, createdBy: userId })
  return toSavingData(doc)
}

export async function getAll(familyId: string): Promise<SavingData[]> {
  const docs = await SavingModel.find({ familyId }).sort({ createdAt: -1 })
  return docs.map(toSavingData)
}

export async function getById(id: string, familyId: string): Promise<SavingData> {
  const doc = await SavingModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Ahorro no encontrado')
  return toSavingData(doc)
}

export async function update(id: string, data: UpdateSavingRequest, familyId: string): Promise<SavingData> {
  const doc = await SavingModel.findOneAndUpdate(
    { _id: id, familyId },
    { $set: data },
    { new: true }
  )
  if (!doc) throw new NotFoundError('Ahorro no encontrado')
  return toSavingData(doc)
}

export async function remove(id: string, familyId: string): Promise<void> {
  const result = await SavingModel.deleteOne({ _id: id, familyId })
  if (result.deletedCount === 0) throw new NotFoundError('Ahorro no encontrado')
}

export async function addContribution(id: string, data: AddContributionRequest, familyId: string, userId: string): Promise<SavingData> {
  const doc = await SavingModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Ahorro no encontrado')

  doc.contributions.push({ amount: data.amount, date: data.date })
  doc.currentAmount = doc.contributions.reduce((s, c) => s + c.amount, 0)
  await doc.save()

  if (data.paymentType) {
    await ExpenseModel.create({
      amount: data.amount,
      category: 'savings',
      description: `Ahorro: ${doc.name}`,
      date: data.date,
      paymentType: data.paymentType,
      creditCardId: data.creditCardId,
      familyId,
      createdBy: userId,
      isEssential: false,
    })
  }

  return toSavingData(doc)
}

export async function removeContribution(id: string, contributionIndex: number, familyId: string): Promise<SavingData> {
  const doc = await SavingModel.findOne({ _id: id, familyId })
  if (!doc) throw new NotFoundError('Ahorro no encontrado')
  if (!doc.contributions[contributionIndex]) throw new NotFoundError('Contribución no encontrada')

  doc.contributions.splice(contributionIndex, 1)
  doc.currentAmount = doc.contributions.reduce((s, c) => s + c.amount, 0)
  await doc.save()

  return toSavingData(doc)
}
