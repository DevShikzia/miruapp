import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createCreditCardSchema, updateCreditCardSchema } from '../schemas/credit-card.schema'
import * as creditCardController from '../controllers/creditCard.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', requireFamilyRole('family_admin', 'member', 'readonly'), creditCardController.getAll)
router.post('/', requireFamilyRole('family_admin', 'member'), validate(createCreditCardSchema), creditCardController.create)
router.get('/:id', requireFamilyRole('family_admin', 'member', 'readonly'), creditCardController.getById)
router.put('/:id', requireFamilyRole('family_admin', 'member'), validate(updateCreditCardSchema), creditCardController.update)
router.delete('/:id', requireFamilyRole('family_admin', 'member'), creditCardController.remove)
router.get('/:id/statement', requireFamilyRole('family_admin', 'member', 'readonly'), creditCardController.getStatement)

export default router
