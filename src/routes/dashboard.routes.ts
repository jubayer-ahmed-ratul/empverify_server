import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/summary', dashboardController.getSummary);
router.get('/recent-employees', dashboardController.getRecentEmployees);
router.get('/recent-verifications', dashboardController.getRecentVerifications);
router.get('/verification-stats', dashboardController.getVerificationStats);
router.get('/department-stats', dashboardController.getDepartmentStats);

export default router;
