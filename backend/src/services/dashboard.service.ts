import { IncomeModel } from '../models/Income.model'
import { ExpenseModel } from '../models/Expense.model'
import { DebtModel } from '../models/Debt.model'
import { SavingModel } from '../models/Saving.model'
import { RecurringBillModel } from '../models/RecurringBill.model'
import * as checklistService from './checklist.service'

import type { IChecklistSummary } from '@shared/types/checklist.types'

interface DashboardData {
  totalIncomes: number
  totalExpenses: number
  balance: number
  pendingDebts: number
  activeSavings: number
  recurringBills: number
  semaforo: 'verde' | 'amarillo' | 'rojo'
  recentIncomes: Array<{ _id: string; amount: number; category: string; date: string }>
  recentExpenses: Array<{ _id: string; amount: number; category: string; date: string; isEssential: boolean }>
  checklist: IChecklistSummary
}

export async function getDashboard(familyId: string): Promise<DashboardData> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

  const [incomes, expenses, debts, savings, bills, checklist] = await Promise.all([
    IncomeModel.find({ familyId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    ExpenseModel.find({ familyId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    DebtModel.find({ familyId, isPaid: false }),
    SavingModel.find({ familyId }),
    RecurringBillModel.find({ familyId, isActive: true }),
    checklistService.getOrCreate(familyId),
  ])

  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncomes - totalExpenses

  let semaforo: 'verde' | 'amarillo' | 'rojo' = 'verde'
  if (balance < 0) semaforo = 'rojo'
  else if (balance < totalIncomes * 0.2) semaforo = 'amarillo'

  return {
    totalIncomes,
    totalExpenses,
    balance,
    semaforo,
    pendingDebts: debts.length,
    activeSavings: savings.length,
    recurringBills: bills.length,
    recentIncomes: incomes.slice(-5).reverse().map((i) => ({
      _id: i._id.toString(),
      amount: i.amount,
      category: i.category,
      date: i.date,
    })),
    recentExpenses: expenses.slice(-5).reverse().map((e) => ({
      _id: e._id.toString(),
      amount: e.amount,
      category: e.category,
      date: e.date,
      isEssential: e.isEssential,
    })),
    checklist: checklist.summary,
  }
}
