export class AppError extends Error {
  statusCode: number
  constructor(mensaje: string, statusCode: number) {
    super(mensaje)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}

export class NotFoundError extends AppError {
  constructor(mensaje = 'Recurso no encontrado') {
    super(mensaje, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(mensaje = 'Token inválido o expirado') {
    super(mensaje, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(mensaje = 'No tenés permiso para realizar esta acción') {
    super(mensaje, 403)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(mensaje = 'Conflicto') {
    super(mensaje, 409)
    this.name = 'ConflictError'
  }
}

export class BadRequestError extends AppError {
  constructor(mensaje = 'Solicitud inválida') {
    super(mensaje, 400)
    this.name = 'BadRequestError'
  }
}
