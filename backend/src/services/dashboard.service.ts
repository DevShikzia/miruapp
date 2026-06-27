import { IncomeModel } from '../models/Income.model'
import { ExpenseModel } from '../models/Expense.model'
import { DebtModel } from '../models/Debt.model'
import { SavingModel } from '../models/Saving.model'
import * as checklistService from './checklist.service'

import type { IChecklistSummary } from '@shared/types/checklist.types'

interface DashboardData {
  balance: number
  variationPercent: number
  totalIncomes: number
  totalExpenses: number
  recentTransactions: Array<{
    _id: string
    name: string
    amount: number
    category: string
    date: string
    type: 'income' | 'expense'
    isEssential: boolean
  }>
  debts: { active: number; total: number; paidPercent: number }
  savingGoal?: { name: string; current: number; target: number }
  semaforo: 'verde' | 'amarillo' | 'rojo'
  checklist: IChecklistSummary
}

async function getMonthTotals(familyId: string, year: number, month: number) {
  const start = new Date(year, month, 1).toISOString().slice(0, 10)
  const end = new Date(year, month + 1, 0).toISOString().slice(0, 10)
  const [incomes, expenses] = await Promise.all([
    IncomeModel.find({ familyId, date: { $gte: start, $lte: end } }),
    ExpenseModel.find({ familyId, date: { $gte: start, $lte: end } }),
  ])
  return {
    incomes: incomes.reduce((s, i) => s + i.amount, 0),
    expenses: expenses.reduce((s, e) => s + e.amount, 0),
  }
}

export async function getDashboard(familyId: string): Promise<DashboardData> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const startOfMonth = new Date(year, month, 1).toISOString().slice(0, 10)
  const endOfMonth = new Date(year, month + 1, 0).toISOString().slice(0, 10)

  const [incomes, expenses, previous, debts, savings, checklist] = await Promise.all([
    IncomeModel.find({ familyId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    ExpenseModel.find({ familyId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    getMonthTotals(familyId, year, month - 1),
    DebtModel.find({ familyId }),
    SavingModel.find({ familyId }),
    checklistService.getOrCreate(familyId),
  ])

  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const balance = totalIncomes - totalExpenses

  const variationPercent = previous.incomes > 0
    ? Math.round(((totalIncomes - previous.incomes) / previous.incomes) * 100)
    : totalIncomes > 0 ? 100 : 0

  let semaforo: 'verde' | 'amarillo' | 'rojo' = 'verde'
  if (balance < 0) semaforo = 'rojo'
  else if (balance < totalIncomes * 0.2) semaforo = 'amarillo'

  const recentTransactions = [
    ...incomes.slice(-5).map(i => ({
      _id: i._id.toString(),
      name: i.description || i.category,
      amount: i.amount,
      category: i.category,
      date: i.date,
      type: 'income' as const,
      isEssential: false,
    })),
    ...expenses.slice(-5).map(e => ({
      _id: e._id.toString(),
      name: e.description || e.category,
      amount: e.amount,
      category: e.category,
      date: e.date,
      type: 'expense' as const,
      isEssential: e.isEssential,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  const totalDebtAmount = debts.reduce((s, d) => s + d.totalAmount, 0)
  const totalPaid = debts.reduce((s, d) => s + d.payments.reduce((ps, p) => ps + p.amount, 0), 0)
  const paidPercent = totalDebtAmount > 0 ? Math.round((totalPaid / totalDebtAmount) * 100) : 0

  const sortedSavings = savings.sort((a, b) => a.deadline.localeCompare(b.deadline))
  const savingGoal = sortedSavings.length > 0
    ? { name: sortedSavings[0].name, current: sortedSavings[0].currentAmount, target: sortedSavings[0].targetAmount }
    : undefined

  return {
    balance,
    variationPercent,
    totalIncomes,
    totalExpenses,
    recentTransactions,
    debts: {
      active: debts.filter(d => !d.isPaid).length,
      total: totalDebtAmount,
      paidPercent,
    },
    savingGoal,
    semaforo,
    checklist: checklist.summary,
  }
}
