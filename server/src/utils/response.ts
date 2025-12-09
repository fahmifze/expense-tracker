import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
  });
}

export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, message, 201);
}

export function sendNotFound(res: Response, message: string = 'Resource not found'): Response {
  return sendError(res, message, 404);
}

export function sendUnauthorized(res: Response, message: string = 'Unauthorized'): Response {
  return sendError(res, message, 401);
}

export function sendServerError(res: Response, message: string = 'Internal server error'): Response {
  return sendError(res, message, 500);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
