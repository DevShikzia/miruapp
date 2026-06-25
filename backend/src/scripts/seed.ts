import { connectDB } from '../config/db'
import { UserModel } from '../models/User.model'
import { hashPassword } from '../utils/bcrypt'
import { env } from '../config/env'

async function seed(): Promise<void> {
  await connectDB()

  const existe = await UserModel.findOne({ platformRole: 'superadmin' })
  if (existe) {
    console.log('[SEED] Superadmin ya existe, omitiendo')
    process.exit(0)
  }

  if (!env.SUPERADMIN_EMAIL || !env.SUPERADMIN_PASSWORD) {
    console.error('[SEED] Faltan SUPERADMIN_EMAIL o SUPERADMIN_PASSWORD en .env')
    process.exit(1)
  }

  const hashedPassword = await hashPassword(env.SUPERADMIN_PASSWORD)

  await UserModel.create({
    name: 'Admin Principal',
    email: env.SUPERADMIN_EMAIL,
    password: hashedPassword,
    platformRole: 'superadmin',
    familyId: null,
    familyRole: null,
    isActive: true,
  })

  console.log('[SEED] Superadmin creado correctamente')
  process.exit(0)
}

seed().catch((err) => {
  console.error('[SEED] Error:', err)
  process.exit(1)
})
