import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeListSchema,
} from '../validators/employee.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  upload.single('photo'),
  validate(createEmployeeSchema),
  employeeController.create
);

router.get('/', validate(employeeListSchema), employeeController.list);

router.get('/:id', employeeController.getById);

router.patch(
  '/:id',
  upload.single('photo'),
  validate(updateEmployeeSchema),
  employeeController.update
);

router.delete('/:id', employeeController.delete);

router.post('/:id/regenerate-qr', employeeController.regenerateQR);

router.get('/:id/id-card', employeeController.getIdCard);

export default router;
