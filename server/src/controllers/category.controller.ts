import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categories = await categoryService.getAllForUser(userId);
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categoryId = parseInt(req.params.id);
    const category = await categoryService.getById(categoryId, userId);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
}

export async function create(
  req: Request<object, object, CreateCategoryInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const category = await categoryService.create(userId, req.body);
    return sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
}

export async function update(
  req: Request<{ id: string }, object, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const categoryId = parseInt(req.params.id);
    const category = await categoryService.update(categoryId, userId, req.body);
    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const categoryId = parseInt(req.params.id);
    await categoryService.deleteCategory(categoryId, userId);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
