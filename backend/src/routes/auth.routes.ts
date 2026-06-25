import { Router } from 'express'
import { authRateLimit } from '../middlewares/rateLimit.middleware'
import { validate } from '../middlewares/validate.middleware'
import { registerSchema, loginSchema, refreshSchema, logoutSchema, googleLoginSchema } from '../schemas/auth.schema'
import * as authController from '../controllers/auth.controller'

const router = Router()

router.post('/register', authRateLimit, validate(registerSchema), authController.register)
router.post('/login', authRateLimit, validate(loginSchema), authController.login)
router.post('/refresh', validate(refreshSchema), authController.refresh)
router.post('/logout', validate(logoutSchema), authController.logout)
router.post('/google', authRateLimit, validate(googleLoginSchema), authController.googleLogin)

export default router
