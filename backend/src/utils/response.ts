import { Response } from 'express'
import {
  ApiSuccessResponse,
  ApiSuccessEmptyResponse,
  ApiPaginatedResponse,
  ApiErrorResponse,
  ApiErrorDetail,
} from '@shared/types/response.types'

export function sendSuccess<T>(res: Response, data: T, mensaje = 'Operación exitosa', statusCode = 200): void {
  const response: ApiSuccessResponse<T> = { ok: true, data, mensaje }
  res.status(statusCode).json(response)
}

export function sendSuccessEmpty(res: Response, mensaje: string, statusCode = 200): void {
  const response: ApiSuccessEmptyResponse = { ok: true, mensaje }
  res.status(statusCode).json(response)
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  mensaje: string
): void {
  const response: ApiPaginatedResponse<T> = { ok: true, data, total, page, limit, mensaje }
  res.status(200).json(response)
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 500,
  detalles?: ApiErrorDetail[]
): void {
  const response: ApiErrorResponse = { ok: false, error, detalles }
  res.status(statusCode).json(response)
}
