import { Request, Response, NextFunction } from 'express';
import * as recurringService from '../services/recurring.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { ListRecurringQuery } from '../validators/recurring.validator';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const query = req.query as unknown as ListRecurringQuery;
    const rules = await recurringService.listRecurringRules(userId, query);
    return sendSuccess(res, rules);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const ruleId = parseInt(req.params.id);
    const rule = await recurringService.getRecurringRule(userId, ruleId);
    return sendSuccess(res, rule);
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const rule = await recurringService.createRecurringRule(userId, req.body);
    return sendCreated(res, rule, 'Recurring rule created successfully');
  } catch (error) {
    next(error);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const ruleId = parseInt(req.params.id);
    const rule = await recurringService.updateRecurringRule(userId, ruleId, req.body);
    return sendSuccess(res, rule, 'Recurring rule updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const ruleId = parseInt(req.params.id);
    await recurringService.deleteRecurringRule(userId, ruleId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}

export async function toggle(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const ruleId = parseInt(req.params.id);
    const rule = await recurringService.toggleRecurringRule(userId, ruleId);
    return sendSuccess(res, rule, 'Recurring rule toggled successfully');
  } catch (error) {
    next(error);
  }
}

export async function upcoming(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const days = req.query.days ? parseInt(req.query.days as string) : 30;
    const rules = await recurringService.getUpcomingRecurring(userId, days);
    return sendSuccess(res, rules);
  } catch (error) {
    next(error);
  }
}

// Admin endpoint to process due recurring rules
export async function processDue(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await recurringService.processDueRules();
    return sendSuccess(res, result, 'Recurring rules processed');
  } catch (error) {
    next(error);
  }
}
