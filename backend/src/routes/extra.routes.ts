import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { toggleChecklistItemSchema, markNotificationReadSchema, markAllNotificationsReadSchema } from '../schemas/extra.schema'
import * as extraController from '../controllers/extra.controller'

const router = Router()
router.use(authMiddleware)

router.get('/dashboard', extraController.getDashboard)
router.get('/checklist', extraController.getChecklist)
router.patch('/checklist/:month/items/:itemId', requireFamilyRole('family_admin', 'member'), validate(toggleChecklistItemSchema), extraController.toggleChecklistItem)

router.get('/notifications', extraController.getNotifications)
router.get('/notifications/unread-count', extraController.getUnreadCount)
router.patch('/notifications/:id/read', validate(markNotificationReadSchema), extraController.markNotificationRead)
router.patch('/notifications/read-all', validate(markAllNotificationsReadSchema), extraController.markAllNotificationsRead)

export default router
