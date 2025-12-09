import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendCreated } from '../utils/response';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export async function register(
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.register(req.body);
    return sendCreated(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    return sendSuccess(res, tokens, 'Token refreshed');
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
}
