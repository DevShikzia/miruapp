import mongoose from 'mongoose'

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI no está definida en .env')
    process.exit(1)
  }

  try {
    await mongoose.connect(uri)
    console.log('[DB] Conectado a MongoDB')
  } catch (error) {
    console.error('[DB] Error de conexión:', error)
    process.exit(1)
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Error en conexión:', err)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Desconectado de MongoDB')
  })
}
