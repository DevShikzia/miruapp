import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { sendSuccess, sendSuccessEmpty, sendError } from '../utils/response'
import { IRegisterRequest, ILoginRequest } from '@shared/types/auth.types'
import { AppError } from '../utils/errors'

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: IRegisterRequest = req.body
    const result = await authService.register(data)
    sendSuccess(res, result, 'Cuenta creada correctamente', 201)
  } catch (error) {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode)
      return
    }
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data: ILoginRequest = req.body
    const result = await authService.login(data)
    sendSuccess(res, result, 'Inicio de sesión exitoso')
  } catch (error) {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode)
      return
    }
    next(error)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body
    const result = await authService.refresh(refreshToken)
    sendSuccess(res, result, 'Token renovado correctamente')
  } catch (error) {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode)
      return
    }
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body
    await authService.logout(refreshToken)
    sendSuccessEmpty(res, 'Sesión cerrada correctamente')
  } catch (error) {
    next(error)
  }
}

export async function googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.loginWithGoogle(req.body)
    sendSuccess(res, result, 'Inicio de sesión exitoso')
  } catch (error) {
    if (error instanceof AppError) {
      sendError(res, error.message, error.statusCode)
      return
    }
    next(error)
  }
}
