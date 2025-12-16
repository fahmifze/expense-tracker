import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import expenseRoutes from './expense.routes';
import userRoutes from './user.routes';
import exportRoutes from './export.routes';
import budgetRoutes from './budget.routes';
import incomeRoutes from './income.routes';
import recurringRoutes from './recurring.routes';
import insightsRoutes from './insights.routes';
import exchangeRateRoutes from './exchangeRate.routes';
import newsRoutes from './news.routes';
import stockRoutes from './stock.routes';

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
router.use('/budgets', budgetRoutes);
router.use('/incomes', incomeRoutes);
router.use('/recurring', recurringRoutes);
router.use('/insights', insightsRoutes);
router.use('/exchange-rates', exchangeRateRoutes);
router.use('/news', newsRoutes);
router.use('/stocks', stockRoutes);

export default router;
