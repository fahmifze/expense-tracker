import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  getExpenseSchema,
  listExpensesSchema,
} from '../validators/expense.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /expenses - List expenses with filters and pagination
router.get('/', validate(listExpensesSchema), expenseController.list);

// GET /expenses/stats - Get expense statistics
router.get('/stats', expenseController.stats);

// GET /expenses/:id - Get single expense
router.get('/:id', validate(getExpenseSchema), expenseController.get);

// POST /expenses - Create expense
router.post('/', validate(createExpenseSchema), expenseController.create);

// PATCH /expenses/:id - Update expense
router.patch('/:id', validate(updateExpenseSchema), expenseController.update);

// DELETE /expenses/:id - Delete expense
router.delete('/:id', validate(getExpenseSchema), expenseController.remove);

export default router;
