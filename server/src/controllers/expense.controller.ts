import { Request, Response, NextFunction } from 'express';
import * as expenseService from '../services/expense.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { ListExpensesQuery } from '../validators/expense.validator';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const query = req.query as unknown as ListExpensesQuery;

    const result = await expenseService.listExpenses(userId, query);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expenseId = parseInt(req.params.id);

    const expense = await expenseService.getExpense(userId, expenseId);
    return sendSuccess(res, expense);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expense = await expenseService.createExpense(userId, req.body);
    return sendCreated(res, expense, 'Expense created successfully');
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expenseId = parseInt(req.params.id);

    const expense = await expenseService.updateExpense(userId, expenseId, req.body);
    return sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expenseId = parseInt(req.params.id);

    await expenseService.deleteExpense(userId, expenseId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function stats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const expenseStats = await expenseService.getExpenseStats(userId);
    return sendSuccess(res, expenseStats);
  } catch (error) {
    next(error);
  }
}
