import { Router } from 'express';
import * as incomeController from '../controllers/income.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createIncomeSchema,
  updateIncomeSchema,
  getIncomeSchema,
  listIncomesSchema,
  createIncomeCategorySchema,
  updateIncomeCategorySchema,
  getIncomeCategorySchema,
} from '../validators/income.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Income Category Routes (must be before /:id to avoid conflicts)
// GET /incomes/categories - List income categories
router.get('/categories', incomeController.listCategories);

// POST /incomes/categories - Create income category
router.post('/categories', validate(createIncomeCategorySchema), incomeController.createCategory);

// GET /incomes/categories/:id - Get single income category
router.get('/categories/:id', validate(getIncomeCategorySchema), incomeController.getCategory);

// PATCH /incomes/categories/:id - Update income category
router.patch('/categories/:id', validate(updateIncomeCategorySchema), incomeController.updateCategory);

// DELETE /incomes/categories/:id - Delete income category
router.delete('/categories/:id', validate(getIncomeCategorySchema), incomeController.deleteCategory);

// Income Routes
// GET /incomes - List incomes with filters and pagination
router.get('/', validate(listIncomesSchema), incomeController.list);

// GET /incomes/stats - Get income statistics
router.get('/stats', incomeController.stats);

// GET /incomes/:id - Get single income
router.get('/:id', validate(getIncomeSchema), incomeController.get);

// POST /incomes - Create income
router.post('/', validate(createIncomeSchema), incomeController.create);

// PATCH /incomes/:id - Update income
router.patch('/:id', validate(updateIncomeSchema), incomeController.update);

// DELETE /incomes/:id - Delete income
router.delete('/:id', validate(getIncomeSchema), incomeController.remove);

export default router;
