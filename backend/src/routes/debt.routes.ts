import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import {
  createDebtSchema, updateDebtSchema,
  createPaymentSchema, updatePaymentSchema,
} from '../schemas/debt.schema'
import * as debtController from '../controllers/debt.controller'

const router = Router()
router.use(authMiddleware)

router.get('/', debtController.getAll)
router.get('/:id', debtController.getById)
router.post('/', requireFamilyRole('family_admin', 'member'), validate(createDebtSchema), debtController.create)
router.put('/:id', requireFamilyRole('family_admin', 'member'), validate(updateDebtSchema), debtController.update)
router.delete('/:id', requireFamilyRole('family_admin', 'member'), debtController.remove)

router.post('/:id/payments', requireFamilyRole('family_admin', 'member'), validate(createPaymentSchema), debtController.addPayment)
router.put('/:id/payments/:paymentIndex', requireFamilyRole('family_admin', 'member'), validate(updatePaymentSchema), debtController.updatePayment)
router.delete('/:id/payments/:paymentIndex', requireFamilyRole('family_admin', 'member'), debtController.removePayment)

export default router
