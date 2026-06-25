import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { sendError } from '../utils/response'

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.name}: ${err.message}`)

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode)
    return
  }

  const mensaje = process.env.NODE_ENV === 'production'
    ? 'Error interno del servidor'
    : err.message

  sendError(res, mensaje, 500)
}
