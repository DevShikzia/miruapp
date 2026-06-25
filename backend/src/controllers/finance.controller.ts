import { Response, NextFunction } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as incomeService from '../services/income.service'
import * as expenseService from '../services/expense.service'
import * as recurringBillService from '../services/recurringBill.service'
import { sendSuccess, sendSuccessEmpty, sendSuccessPaginated } from '../utils/response'

function getFamilyId(req: AuthRequest): string {
  return req.user!.familyId || ''
}

export async function createIncome(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await incomeService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Ingreso registrado correctamente', 201)
  } catch (error) { next(error) }
}

export async function getAllIncomes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as any
    const result = await incomeService.getAll(getFamilyId(req), startDate, endDate)
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function getIncomeById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await incomeService.getById(req.params.id, getFamilyId(req))
    sendSuccess(res, result)
  } catch (error) { next(error) }
}

export async function updateIncome(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await incomeService.update(req.params.id, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Ingreso actualizado correctamente')
  } catch (error) { next(error) }
}

export async function deleteIncome(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await incomeService.remove(req.params.id, getFamilyId(req))
    sendSuccessEmpty(res, 'Ingreso eliminado correctamente')
  } catch (error) { next(error) }
}

export async function createExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await expenseService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Gasto registrado correctamente', 201)
  } catch (error) { next(error) }
}

export async function getAllExpenses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { startDate, endDate } = req.query as any
    const result = await expenseService.getAll(getFamilyId(req), startDate, endDate)
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function updateExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await expenseService.update(req.params.id, req.body, getFamilyId(req))
    sendSuccess(res, result, 'Gasto actualizado correctamente')
  } catch (error) { next(error) }
}

export async function deleteExpense(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await expenseService.remove(req.params.id, getFamilyId(req))
    sendSuccessEmpty(res, 'Gasto eliminado correctamente')
  } catch (error) { next(error) }
}

export async function createRecurringBill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await recurringBillService.create(req.body, getFamilyId(req), req.user!._id)
    sendSuccess(res, result, 'Gasto recurrente registrado correctamente', 201)
  } catch (error) { next(error) }
}

export async function getAllRecurringBills(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await recurringBillService.getAll(getFamilyId(req))
    sendSuccessPaginated(res, result, result.length)
  } catch (error) { next(error) }
}

export async function toggleRecurringBill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await recurringBillService.toggleActive(req.params.id, getFamilyId(req))
    sendSuccess(res, result, 'Estado actualizado correctamente')
  } catch (error) { next(error) }
}

export async function deleteRecurringBill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await recurringBillService.remove(req.params.id, getFamilyId(req))
    sendSuccessEmpty(res, 'Gasto recurrente eliminado correctamente')
  } catch (error) { next(error) }
}
