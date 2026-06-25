import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createSavingSchema, updateSavingSchema, addContributionSchema } from '../schemas/saving.schema'
import * as savingController from '../controllers/saving.controller'

const router = Router()
router.use(authMiddleware)

router.get('/', savingController.getAll)
router.get('/:id', savingController.getById)
router.post('/', requireFamilyRole('family_admin', 'member'), validate(createSavingSchema), savingController.create)
router.put('/:id', requireFamilyRole('family_admin', 'member'), validate(updateSavingSchema), savingController.update)
router.delete('/:id', requireFamilyRole('family_admin', 'member'), savingController.remove)
router.post('/:id/contributions', requireFamilyRole('family_admin', 'member'), validate(addContributionSchema), savingController.addContribution)
router.delete('/:id/contributions/:contributionIndex', requireFamilyRole('family_admin', 'member'), savingController.removeContribution)

export default router
