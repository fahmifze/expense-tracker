import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/categories - List all categories
router.get('/', categoryController.getAll);

// GET /api/categories/:id - Get single category
router.get('/:id', categoryController.getOne);

// POST /api/categories - Create custom category
router.post('/', validate(createCategorySchema), categoryController.create);

// PATCH /api/categories/:id - Update category
router.patch('/:id', validate(updateCategorySchema), categoryController.update);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

export default router;
