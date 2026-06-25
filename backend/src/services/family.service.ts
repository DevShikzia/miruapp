import { FamilyModel, IFamilyDocument } from '../models/Family.model'
import { UserModel } from '../models/User.model'
import { ICreateFamilyRequest, FamilyData } from '@shared/types/family.types'
import { IUserPublic } from '@shared/types/auth.types'
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from '../utils/errors'

function toFamilyData(family: IFamilyDocument): FamilyData {
  return {
    _id: family._id.toString(),
    name: family.name,
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

  const family = await FamilyModel.create({
    name: data.name.trim(),
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
