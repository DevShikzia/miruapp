import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { sendError } from '../utils/response'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const detalles = error.errors.map((e) => ({
          campo: e.path.join('.'),
          mensaje: e.message,
        }))
        sendError(res, 'Error de validación', 400, detalles)
        return
      }
      sendError(res, 'Error de validación', 400)
    }
  }
}
