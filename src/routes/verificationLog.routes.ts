import { Router } from 'express';
import { verificationLogController } from '../controllers/verificationLog.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { verificationLogsSchema } from '../validators/dashboard.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate(verificationLogsSchema), verificationLogController.list);

export default router;
