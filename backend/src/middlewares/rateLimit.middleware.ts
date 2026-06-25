import rateLimit from 'express-rate-limit'

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    ok: false,
    error: 'Demasiados intentos. Intentá de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})
