import api from './api';
import { User } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  currency?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/users/profile');
  return response.data.data!;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.patch<ApiResponse<User>>('/users/profile', data);
  return response.data.data!;
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  const response = await api.post<ApiResponse<{ message: string }>>('/users/change-password', data);
  return response.data.data!;
}

export async function deleteAccount(password: string): Promise<{ message: string }> {
  const response = await api.delete<ApiResponse<{ message: string }>>('/users/account', {
    data: { password },
  });
  return response.data.data!;
}
