import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { auditLogsSchema } from '../validators/dashboard.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', validate(auditLogsSchema), auditController.list);

export default router;
