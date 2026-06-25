import mongoose, { Schema, Document } from 'mongoose'
import { IUser } from '@shared/types/auth.types'

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false, select: false },
  googleId: { type: String },
  platformRole: {
    type: String,
    enum: ['superadmin', 'agent', 'user'],
    default: 'user',
  },
  familyId: { type: String, default: null },
  familyRole: {
    type: String,
    enum: ['family_admin', 'member', 'readonly', null],
    default: null,
  },
  isActive: { type: Boolean, default: true },
  pushSubscription: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
})

UserSchema.index({ familyId: 1 })
UserSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } })

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema)
