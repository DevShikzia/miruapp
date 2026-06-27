import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import * as checklistController from '../controllers/checklist.controller'

const router = Router()

router.use(authMiddleware)

router.get('/', checklistController.getOrCreate)
router.patch('/:month/items/:itemId', checklistController.toggleItem)
router.post('/:month/items', checklistController.addItem)
router.delete('/:month/items/:itemId', checklistController.deleteItem)

export default router
