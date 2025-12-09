import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from '../validators/user.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /users/profile - Get current user profile
router.get('/profile', userController.getProfile);

// PATCH /users/profile - Update profile
router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

// POST /users/change-password - Change password
router.post('/change-password', validate(changePasswordSchema), userController.changePassword);

// DELETE /users/account - Delete account
router.delete('/account', userController.deleteAccount);

export default router;
