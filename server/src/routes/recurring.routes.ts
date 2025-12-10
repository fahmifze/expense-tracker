import { Router } from 'express';
import * as recurringController from '../controllers/recurring.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createRecurringSchema,
  updateRecurringSchema,
  getRecurringSchema,
  listRecurringSchema,
} from '../validators/recurring.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /recurring - List all recurring rules
router.get('/', validate(listRecurringSchema), recurringController.list);

// GET /recurring/upcoming - Get upcoming recurring transactions
router.get('/upcoming', recurringController.upcoming);

// POST /recurring/process - Process due recurring rules (admin/cron endpoint)
router.post('/process', recurringController.processDue);

// GET /recurring/:id - Get single recurring rule
router.get('/:id', validate(getRecurringSchema), recurringController.get);

// POST /recurring - Create recurring rule
router.post('/', validate(createRecurringSchema), recurringController.create);

// PATCH /recurring/:id - Update recurring rule
router.patch('/:id', validate(updateRecurringSchema), recurringController.update);

// PATCH /recurring/:id/toggle - Toggle recurring rule active status
router.patch('/:id/toggle', validate(getRecurringSchema), recurringController.toggle);

// DELETE /recurring/:id - Delete recurring rule
router.delete('/:id', validate(getRecurringSchema), recurringController.remove);

export default router;
