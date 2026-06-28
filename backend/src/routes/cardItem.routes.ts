import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createCardItemSchema, updateCardItemSchema } from '../schemas/card-item.schema'
import * as cardItemController from '../controllers/cardItem.controller'

const router = Router()
router.use(authMiddleware)
router.use(requireFamilyRole('family_admin', 'member', 'readonly'))

router.get('/active', cardItemController.getActive)
router.get('/rate', cardItemController.getRate)
router.get('/card/:cardId', cardItemController.getByCard)
router.get('/:id', cardItemController.getById)
router.post('/', validate(createCardItemSchema), cardItemController.create)
router.put('/:id', validate(updateCardItemSchema), cardItemController.update)
router.delete('/:id', cardItemController.remove)

export default router
