import * as UserModel from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password';
import { UpdateProfileInput, ChangePasswordInput } from '../validators/user.validator';
import { AppError } from '../middleware/error.middleware';

export async function getProfile(userId: number) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return UserModel.toUserPublic(user);
}

export async function updateProfile(userId: number, data: UpdateProfileInput) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw AppError.notFound('User not found');
  }

  const updatedUser = await UserModel.updateProfile(userId, {
    firstName: data.firstName,
    lastName: data.lastName,
    currency: data.currency,
  });

  if (!updatedUser) {
    throw AppError.badRequest('Failed to update profile');
  }

  return UserModel.toUserPublic(updatedUser);
}

export async function changePassword(userId: number, data: ChangePasswordInput) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw AppError.notFound('User not found');
  }

  // Verify current password
  const isValidPassword = await comparePassword(data.currentPassword, user.password_hash);

  if (!isValidPassword) {
    throw AppError.unauthorized('Current password is incorrect');
  }

  // Hash and update new password
  const newPasswordHash = await hashPassword(data.newPassword);
  await UserModel.updatePassword(userId, newPasswordHash);

  return { message: 'Password changed successfully' };
}

export async function deleteAccount(userId: number, password: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw AppError.notFound('User not found');
  }

  // Verify password before deletion
  const isValidPassword = await comparePassword(password, user.password_hash);

  if (!isValidPassword) {
    throw AppError.unauthorized('Password is incorrect');
  }

  await UserModel.deleteUser(userId);

  return { message: 'Account deleted successfully' };
}
