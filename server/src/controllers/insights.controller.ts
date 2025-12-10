import { Request, Response, NextFunction } from 'express';
import * as insightsService from '../services/insights.service';
import { sendSuccess } from '../utils/response';

export async function getInsights(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const insights = await insightsService.getInsights(userId);
    return sendSuccess(res, insights);
  } catch (error) {
    next(error);
  }
}

export async function getFinancialSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const summary = await insightsService.getFinancialSummary(userId);
    return sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
}
