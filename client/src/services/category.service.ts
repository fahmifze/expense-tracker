import api from './api';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types';
import { ApiResponse } from '../types/api.types';

export async function getCategories(): Promise<Category[]> {
  const response = await api.get<ApiResponse<Category[]>>('/categories');
  return response.data.data || [];
}

export async function getCategory(id: number): Promise<Category> {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  return response.data.data!;
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  const response = await api.post<ApiResponse<Category>>('/categories', data);
  return response.data.data!;
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
  const response = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
  return response.data.data!;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
