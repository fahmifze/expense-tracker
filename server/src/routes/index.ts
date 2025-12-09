import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import expenseRoutes from './expense.routes';
import userRoutes from './user.routes';
import exportRoutes from './export.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/expenses', expenseRoutes);
router.use('/users', userRoutes);
router.use('/export', exportRoutes);

export default router;
