import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createIncomeSchema, updateIncomeSchema,
  createExpenseSchema, updateExpenseSchema,
  createRecurringBillSchema, updateRecurringBillSchema,
  toggleRecurringBillSchema,
} from '../schemas/finance.schema'
import * as financeController from '../controllers/finance.controller'

const router = Router()
router.use(authMiddleware)
router.use(requireFamilyRole('family_admin', 'member'))

router.post('/incomes', validate(createIncomeSchema), financeController.createIncome)
router.get('/incomes', financeController.getAllIncomes)
router.get('/incomes/:id', financeController.getIncomeById)
router.put('/incomes/:id', validate(updateIncomeSchema), financeController.updateIncome)
router.delete('/incomes/:id', financeController.deleteIncome)

router.post('/expenses', validate(createExpenseSchema), financeController.createExpense)
router.get('/expenses', financeController.getAllExpenses)
router.put('/expenses/:id', validate(updateExpenseSchema), financeController.updateExpense)
router.delete('/expenses/:id', financeController.deleteExpense)

router.post('/recurring-bills', validate(createRecurringBillSchema), financeController.createRecurringBill)
router.get('/recurring-bills', financeController.getAllRecurringBills)
router.patch('/recurring-bills/:id/toggle', validate(toggleRecurringBillSchema), financeController.toggleRecurringBill)
router.delete('/recurring-bills/:id', financeController.deleteRecurringBill)

export default router
