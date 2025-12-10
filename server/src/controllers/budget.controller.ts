import { Request, Response, NextFunction } from 'express';
import * as budgetService from '../services/budget.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const budgets = await budgetService.listBudgets(userId);
    return sendSuccess(res, budgets);
  } catch (error) {
    next(error);
  }
}

export async function listWithStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const budgets = await budgetService.getBudgetsWithStatus(userId);
    return sendSuccess(res, budgets);
  } catch (error) {
    next(error);
  }
}

export async function getAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const alerts = await budgetService.getBudgetAlerts(userId);
    return sendSuccess(res, alerts);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const budgetId = parseInt(req.params.id);
    const budget = await budgetService.getBudget(userId, budgetId);
    return sendSuccess(res, budget);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const budget = await budgetService.createBudget(userId, req.body);
    return sendCreated(res, budget, 'Budget created successfully');
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const budgetId = parseInt(req.params.id);
    const budget = await budgetService.updateBudget(userId, budgetId, req.body);
    return sendSuccess(res, budget, 'Budget updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const budgetId = parseInt(req.params.id);
    await budgetService.deleteBudget(userId, budgetId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
