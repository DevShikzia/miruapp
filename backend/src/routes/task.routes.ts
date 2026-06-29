import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createTaskSchema, updateTaskSchema } from '../schemas/task.schema'
import * as taskController from '../controllers/task.controller'

const router = Router()
router.use(authMiddleware)

router.get('/', requireFamilyRole('family_admin', 'member', 'readonly'), taskController.getAll)
router.get('/completed', requireFamilyRole('family_admin', 'member', 'readonly'), taskController.getCompleted)
router.get('/:id', requireFamilyRole('family_admin', 'member', 'readonly'), taskController.getById)
router.post('/', requireFamilyRole('family_admin', 'member'), validate(createTaskSchema), taskController.create)
router.put('/:id', requireFamilyRole('family_admin', 'member'), validate(updateTaskSchema), taskController.update)
router.delete('/:id', requireFamilyRole('family_admin', 'member'), taskController.remove)
router.patch('/:id/toggle', requireFamilyRole('family_admin', 'member'), taskController.toggle)

router.post('/:id/subtasks', requireFamilyRole('family_admin', 'member'), taskController.addSubtask)
router.delete('/:id/subtasks/:subtaskId', requireFamilyRole('family_admin', 'member'), taskController.removeSubtask)
router.patch('/:id/subtasks/toggle', requireFamilyRole('family_admin', 'member'), taskController.toggleSubtask)

export default router