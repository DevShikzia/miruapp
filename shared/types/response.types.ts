export interface ApiSuccessResponse<T> {
  ok: true
  data: T
  mensaje: string
}

export interface ApiSuccessEmptyResponse {
  ok: true
  mensaje: string
}

export interface ApiPaginatedResponse<T> {
  ok: true
  data: T[]
  total: number
  page: number
  limit: number
  mensaje: string
}

export interface ApiErrorResponse {
  ok: false
  error: string
  detalles?: ApiErrorDetail[]
}

export interface ApiErrorDetail {
  campo: string
  mensaje: string
}
