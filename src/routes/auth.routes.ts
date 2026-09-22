import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { loginSchema } from '../validators/auth.validator';
import { loginLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
