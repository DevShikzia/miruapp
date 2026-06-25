import mongoose, { Schema, Document } from 'mongoose'

export interface IFamilyDocument extends Document {
  name: string
  inviteCode: string
  members: Array<{
    userId: string
    role: 'family_admin' | 'member' | 'readonly'
    invitedAt: Date
    acceptedAt: Date | null
  }>
  createdAt: Date
  updatedAt: Date
}

const FamilySchema = new Schema<IFamilyDocument>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  inviteCode: { type: String, required: true, unique: true },
  members: [{
    userId: { type: String, required: true },
    role: { type: String, enum: ['family_admin', 'member', 'readonly'], required: true },
    invitedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date, default: null },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

FamilySchema.index({ 'members.userId': 1 })
FamilySchema.index({ inviteCode: 1 }, { unique: true })

export const FamilyModel = mongoose.model<IFamilyDocument>('Family', FamilySchema)
