import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware'
import { requireFamilyRole } from '../middlewares/role.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createFamilySchema, inviteMemberSchema, respondInviteSchema, joinFamilySchema } from '../schemas/family.schema'
import * as familyController from '../controllers/family.controller'

const router = Router()

router.use(authMiddleware)

router.get('/my', familyController.getMyFamily)
router.post('/', validate(createFamilySchema), familyController.create)
router.post('/join', validate(joinFamilySchema), familyController.join)
router.post('/invite', requireFamilyRole('family_admin'), validate(inviteMemberSchema), familyController.invite)
router.post('/respond-invite', validate(respondInviteSchema), familyController.respondInvite)
router.delete('/:familyId/members/:userId', requireFamilyRole('family_admin'), familyController.removeMember)

export default router
