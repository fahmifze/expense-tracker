import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const profile = await userService.getProfile(userId);
    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const profile = await userService.updateProfile(userId, req.body);
    return sendSuccess(res, profile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await userService.changePassword(userId, req.body);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { password } = req.body;

    if (!password) {
      throw AppError.badRequest('Password is required');
    }

    const result = await userService.deleteAccount(userId, password);
    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
