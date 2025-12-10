import { Router } from 'express';
import * as insightsController from '../controllers/insights.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /insights - Get personalized insights
router.get('/', insightsController.getInsights);

// GET /insights/summary - Get financial summary
router.get('/summary', insightsController.getFinancialSummary);

export default router;
