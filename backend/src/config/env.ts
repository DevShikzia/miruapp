import dotenv from 'dotenv'
dotenv.config()

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',
  SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL || '',
  SUPERADMIN_PASSWORD: process.env.SUPERADMIN_PASSWORD || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
} as const

const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const
for (const key of requiredVars) {
  if (!env[key]) {
    console.error(`[ENV] Falta variable obligatoria: ${key}`)
    process.exit(1)
  }
}
