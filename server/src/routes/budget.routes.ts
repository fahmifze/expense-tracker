import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createBudgetSchema,
  updateBudgetSchema,
  getBudgetSchema,
} from '../validators/budget.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /budgets - List all budgets
router.get('/', budgetController.list);

// GET /budgets/status - Get budgets with spending status
router.get('/status', budgetController.listWithStatus);

// GET /budgets/alerts - Get budget alerts
router.get('/alerts', budgetController.getAlerts);

// GET /budgets/:id - Get single budget
router.get('/:id', validate(getBudgetSchema), budgetController.get);

// POST /budgets - Create budget
router.post('/', validate(createBudgetSchema), budgetController.create);

// PATCH /budgets/:id - Update budget
router.patch('/:id', validate(updateBudgetSchema), budgetController.update);

// DELETE /budgets/:id - Delete budget
router.delete('/:id', validate(getBudgetSchema), budgetController.remove);

export default router;
