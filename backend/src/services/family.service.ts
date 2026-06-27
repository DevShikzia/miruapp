import crypto from 'crypto'
import { FamilyModel, IFamilyDocument } from '../models/Family.model'
import { UserModel } from '../models/User.model'
import { ICreateFamilyRequest, FamilyData, FamilyBalanceResponse, MemberContribution, ActivityItem } from '@shared/types/family.types'
import { IncomeModel } from '../models/Income.model'
import { ExpenseModel } from '../models/Expense.model'
import { DebtModel } from '../models/Debt.model'
import { SavingModel } from '../models/Saving.model'
import { IUserPublic } from '@shared/types/auth.types'
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../utils/errors'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  // legible: sin 0/O/I/1/L
  return Array.from(crypto.randomBytes(6)).map(b => chars[b % 30]).join('')
}

function toFamilyData(family: IFamilyDocument): FamilyData {
  return {
    _id: family._id.toString(),
    name: family.name,
    inviteCode: family.inviteCode,
    members: family.members.map((m) => ({
      userId: m.userId,
      role: m.role as 'family_admin' | 'member' | 'readonly',
      invitedAt: m.invitedAt.toISOString(),
      acceptedAt: m.acceptedAt?.toISOString() || null,
    })),
    createdAt: family.createdAt.toISOString(),
  }
}

export async function createFamily(data: ICreateFamilyRequest, creator: IUserPublic): Promise<FamilyData> {
  const isInFamily = await FamilyModel.findOne({ 'members.userId': creator._id, 'members.acceptedAt': { $ne: null } })
  if (isInFamily) throw new ConflictError('Ya pertenecés a una familia')

  let inviteCode = generateInviteCode()
  while (await FamilyModel.findOne({ inviteCode })) {
    inviteCode = generateInviteCode()
  }

  const family = await FamilyModel.create({
    name: data.name.trim(),
    inviteCode,
    members: [{
      userId: creator._id,
      role: 'family_admin',
      invitedAt: new Date(),
      acceptedAt: new Date(),
    }],
  })

  await UserModel.findByIdAndUpdate(creator._id, {
    familyId: family._id.toString(),
    familyRole: 'family_admin',
  })

  return toFamilyData(family)
}

export async function inviteMember(familyId: string, data: { email: string; role: 'member' | 'readonly' }): Promise<FamilyData> {
  const targetUser = await UserModel.findOne({ email: data.email.toLowerCase() })
  if (!targetUser) throw new NotFoundError('Usuario no encontrado')

  const family = await FamilyModel.findById(familyId)
  if (!family) throw new NotFoundError('Familia no encontrada')

  const yaInvitado = family.members.find((m) => m.userId === targetUser._id.toString())
  if (yaInvitado) {
    if (yaInvitado.acceptedAt) throw new ConflictError('El usuario ya es miembro de la familia')
    throw new ConflictError('El usuario ya está invitado')
  }

  family.members.push({
    userId: targetUser._id.toString(),
    role: data.role,
    invitedAt: new Date(),
    acceptedAt: null,
  })
  await family.save()

  return toFamilyData(family)
}

export async function respondInvite(userId: string, _inviteId: string, accept: boolean): Promise<FamilyData> {
  const family = await FamilyModel.findOne({ 'members.userId': userId })
  if (!family) throw new NotFoundError('Familia no encontrada')

  const member = family.members.find((m) => m.userId === userId)
  if (!member) throw new NotFoundError('No tenés invitaciones pendientes')
  if (member.acceptedAt) throw new ConflictError('Ya sos miembro de esta familia')

  if (accept) {
    member.acceptedAt = new Date()
    await family.save()
    await UserModel.findByIdAndUpdate(userId, {
      familyId: family._id.toString(),
      familyRole: member.role,
    })
  } else {
    family.members = family.members.filter((m) => m.userId !== userId)
    await family.save()
  }

  return toFamilyData(family)
}

export async function joinByCode(inviteCode: string, user: IUserPublic): Promise<FamilyData> {
  const family = await FamilyModel.findOne({ inviteCode: inviteCode.toUpperCase() })
  if (!family) throw new NotFoundError('Código de invitación inválido')

  const existing = family.members.find((m) => m.userId === user._id)
  if (existing) {
    if (existing.acceptedAt) throw new ConflictError('Ya sos miembro de esta familia')
    existing.acceptedAt = new Date()
    await family.save()
    await UserModel.findByIdAndUpdate(user._id, {
      familyId: family._id.toString(),
      familyRole: existing.role,
    })
    return toFamilyData(family)
  }

  family.members.push({
    userId: user._id,
    role: 'member',
    invitedAt: new Date(),
    acceptedAt: new Date(),
  })
  await family.save()

  await UserModel.findByIdAndUpdate(user._id, {
    familyId: family._id.toString(),
    familyRole: 'member',
  })

  return toFamilyData(family)
}

export async function getFamily(familyId: string): Promise<FamilyData> {
  const family = await FamilyModel.findById(familyId)
  if (!family) throw new NotFoundError('Familia no encontrada')
  return toFamilyData(family)
}

export async function getMyFamily(userId: string): Promise<FamilyData> {
  const family = await FamilyModel.findOne({ 'members.userId': userId })
  if (!family) throw new NotFoundError('No pertenecés a ninguna familia')
  return toFamilyData(family)
}

const AVATAR_COLORS = ['#E4B3E9', '#5B8DEF', '#15C48C', '#C99A0A', '#E05252', '#9B6EF3']

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export async function getFamilyBalance(familyId: string, userId: string): Promise<FamilyBalanceResponse> {
  const family = await FamilyModel.findById(familyId)
  if (!family) throw new NotFoundError('Familia no encontrada')

  const memberUserIds = family.members.filter(m => m.acceptedAt).map(m => m.userId)
  const users = await UserModel.find({ _id: { $in: memberUserIds } }).lean()
  const userMap = new Map(users.map(u => [u._id.toString(), u]))

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

  const [incomes, expenses, debts, savings] = await Promise.all([
    IncomeModel.find({ familyId, date: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    ExpenseModel.find({ familyId, date: { $gte: startOfMonth, $lte: endOfMonth } }).lean(),
    DebtModel.find({ familyId }).sort({ createdAt: -1 }).limit(5).lean(),
    SavingModel.find({ familyId }).sort({ createdAt: -1 }).limit(5).lean(),
  ])

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0)

  const incomeByUser = new Map<string, number>()
  const expenseByUser = new Map<string, number>()
  for (const inc of incomes) incomeByUser.set(inc.createdBy, (incomeByUser.get(inc.createdBy) || 0) + inc.amount)
  for (const exp of expenses) expenseByUser.set(exp.createdBy, (expenseByUser.get(exp.createdBy) || 0) + exp.amount)

  const members: MemberContribution[] = memberUserIds.map((uid, idx) => {
    const u = userMap.get(uid)
    return {
      userId: uid,
      name: u?.name || 'Usuario',
      initials: getInitials(u?.name || 'Usuario'),
      avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
      totalIncome: incomeByUser.get(uid) || 0,
      totalExpense: expenseByUser.get(uid) || 0,
    }
  })

  const activity: ActivityItem[] = [
    ...incomes.slice(-5).reverse().map(i => ({
      id: 'inc_' + i._id.toString(),
      type: 'income' as const,
      action: 'agregó un ingreso',
      userName: userMap.get(i.createdBy)?.name || 'Alguien',
      description: `$ ${i.amount.toLocaleString('es-AR')}` + (i.category ? ` en ${i.category}` : ''),
      timestamp: i.createdAt?.toISOString?.() || i.date,
    })),
    ...expenses.slice(-5).reverse().map(e => ({
      id: 'exp_' + e._id.toString(),
      type: 'expense' as const,
      action: 'agregó un gasto',
      userName: userMap.get(e.createdBy)?.name || 'Alguien',
      description: `$ ${e.amount.toLocaleString('es-AR')}` + (e.category ? ` en ${e.category}` : ''),
      timestamp: e.createdAt?.toISOString?.() || e.date,
    })),
    ...debts.map(d => ({
      id: 'debt_' + d._id.toString(),
      type: 'debt' as const,
      action: d.isPaid ? 'marcó como pagada' : 'registró la deuda',
      userName: userMap.get(d.createdBy)?.name || 'Alguien',
      description: `"${d.personName}" por $ ${d.totalAmount.toLocaleString('es-AR')}`,
      timestamp: d.createdAt?.toISOString?.() || '',
    })),
    ...savings.map(s => ({
      id: 'sav_' + s._id.toString(),
      type: 'saving' as const,
      action: 'creó la meta',
      userName: userMap.get(s.createdBy)?.name || 'Alguien',
      description: `"${s.name}"`,
      timestamp: s.createdAt?.toISOString?.() || '',
    })),
  ]
  activity.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  const recentActivity = activity.slice(0, 10)

  return {
    balance: { totalIncome, totalExpense, netBalance: totalIncome - totalExpense },
    members,
    activity: recentActivity,
  }
}

export async function removeMember(familyId: string, targetUserId: string): Promise<FamilyData> {
  const family = await FamilyModel.findById(familyId)
  if (!family) throw new NotFoundError('Familia no encontrada')

  const memberIndex = family.members.findIndex((m) => m.userId === targetUserId)
  if (memberIndex === -1) throw new NotFoundError('El usuario no es miembro de esta familia')

  family.members.splice(memberIndex, 1)
  await family.save()

  await UserModel.findByIdAndUpdate(targetUserId, {
    familyId: null,
    familyRole: null,
  })

  return toFamilyData(family)
}
