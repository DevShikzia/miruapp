import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDB } from './config/db'
import { env } from './config/env'
import { errorMiddleware } from './middlewares/error.middleware'
import authRoutes from './routes/auth.routes'
import familyRoutes from './routes/family.routes'
import financeRoutes from './routes/finance.routes'

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mensaje: 'Miru API funcionando' })
})

app.use('/api/auth', authRoutes)
app.use('/api/family', familyRoutes)
app.use('/api/finance', financeRoutes)
app.use(errorMiddleware)

async function start(): Promise<void> {
  await connectDB()
  app.listen(env.PORT, () => {
    console.log(`[SERVER] Miru API corriendo en puerto ${env.PORT}`)
    console.log(`[SERVER] Entorno: ${env.NODE_ENV}`)
  })
}

start().catch((err) => {
  console.error('[SERVER] Error al iniciar:', err)
  process.exit(1)
})

export default app
