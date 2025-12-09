import * as categoryModel from '../models/category.model';
import { AppError } from '../middleware/error.middleware';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export async function getAllForUser(userId: number): Promise<categoryModel.CategoryPublic[]> {
  const categories = await categoryModel.findAllForUser(userId);
  return categories.map(categoryModel.toCategoryPublic);
}

export async function getById(categoryId: number, userId: number): Promise<categoryModel.CategoryPublic> {
  const category = await categoryModel.findById(categoryId);

  if (!category) {
    throw AppError.notFound('Category not found');
  }

  // Check if user can access this category
  const canAccess = await categoryModel.canUserAccess(categoryId, userId);
  if (!canAccess) {
    throw AppError.notFound('Category not found');
  }

  return categoryModel.toCategoryPublic(category);
}

export async function create(
  userId: number,
  data: CreateCategoryInput
): Promise<categoryModel.CategoryPublic> {
  // Check if name already exists for user
  const nameExists = await categoryModel.nameExistsForUser(data.name, userId);
  if (nameExists) {
    throw AppError.conflict('Category with this name already exists');
  }

  const category = await categoryModel.create({
    userId,
    name: data.name,
    icon: data.icon,
    color: data.color,
  });

  return categoryModel.toCategoryPublic(category);
}

export async function update(
  categoryId: number,
  userId: number,
  data: UpdateCategoryInput
): Promise<categoryModel.CategoryPublic> {
  // Check if category exists and belongs to user
  const isOwned = await categoryModel.isOwnedByUser(categoryId, userId);
  if (!isOwned) {
    // Check if it's a default category
    const category = await categoryModel.findById(categoryId);
    if (category && category.is_default) {
      throw AppError.forbidden('Cannot modify default categories');
    }
    throw AppError.notFound('Category not found');
  }

  // Check if new name already exists
  if (data.name) {
    const nameExists = await categoryModel.nameExistsForUser(data.name, userId, categoryId);
    if (nameExists) {
      throw AppError.conflict('Category with this name already exists');
    }
  }

  const category = await categoryModel.update(categoryId, data);
  if (!category) {
    throw AppError.badRequest('Failed to update category');
  }

  return categoryModel.toCategoryPublic(category);
}

export async function deleteCategory(categoryId: number, userId: number): Promise<void> {
  // Check if category exists and belongs to user
  const isOwned = await categoryModel.isOwnedByUser(categoryId, userId);
  if (!isOwned) {
    // Check if it's a default category
    const category = await categoryModel.findById(categoryId);
    if (category && category.is_default) {
      throw AppError.forbidden('Cannot delete default categories');
    }
    throw AppError.notFound('Category not found');
  }

  await categoryModel.deleteCategory(categoryId);
}
