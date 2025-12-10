import { Request, Response, NextFunction } from 'express';
import * as incomeService from '../services/income.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { ListIncomesQuery } from '../validators/income.validator';

// Income CRUD
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const query = req.query as unknown as ListIncomesQuery;
    const result = await incomeService.listIncomes(userId, query);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const incomeId = parseInt(req.params.id);
    const income = await incomeService.getIncome(userId, incomeId);
    return sendSuccess(res, income);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const income = await incomeService.createIncome(userId, req.body);
    return sendCreated(res, income, 'Income created successfully');
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const incomeId = parseInt(req.params.id);
    const income = await incomeService.updateIncome(userId, incomeId, req.body);
    return sendSuccess(res, income, 'Income updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const incomeId = parseInt(req.params.id);
    await incomeService.deleteIncome(userId, incomeId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const incomeStats = await incomeService.getIncomeStats(userId);
    return sendSuccess(res, incomeStats);
  } catch (error) {
    next(error);
  }
}

// Income Category CRUD
export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categories = await incomeService.listIncomeCategories(userId);
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categoryId = parseInt(req.params.id);
    const category = await incomeService.getIncomeCategory(userId, categoryId);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const category = await incomeService.createIncomeCategory(userId, req.body);
    return sendCreated(res, category, 'Income category created successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categoryId = parseInt(req.params.id);
    const category = await incomeService.updateIncomeCategory(userId, categoryId, req.body);
    return sendSuccess(res, category, 'Income category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categoryId = parseInt(req.params.id);
    await incomeService.deleteIncomeCategory(userId, categoryId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
