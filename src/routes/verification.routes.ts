import { Router } from 'express';
import { verificationController } from '../controllers/verification.controller';
import { verificationLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// Public route - no authentication required
router.get('/:verificationToken', verificationLimiter, verificationController.verify);

export default router;
