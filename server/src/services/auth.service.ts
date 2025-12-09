import * as userModel from '../models/user.model';
import * as tokenModel from '../models/token.model';
import { hashPassword, comparePassword } from '../utils/password';
import { generateTokenPair, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

export interface AuthResult {
  user: userModel.UserPublic;
  accessToken: string;
  refreshToken: string;
}

export async function register(data: RegisterInput): Promise<AuthResult> {
  // Check if email exists
  const existingUser = await userModel.findByEmail(data.email);
  if (existingUser) {
    throw AppError.conflict('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await userModel.create({
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
  });

  // Generate tokens
  const tokens = generateTokenPair({ userId: user.id, email: user.email });

  // Store refresh token
  await tokenModel.create(user.id, tokens.refreshToken, getRefreshTokenExpiry());

  return {
    user: userModel.toUserPublic(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function login(data: LoginInput): Promise<AuthResult> {
  // Find user
  const user = await userModel.findByEmail(data.email);
  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Check password
  const isValid = await comparePassword(data.password, user.password_hash);
  if (!isValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const tokens = generateTokenPair({ userId: user.id, email: user.email });

  // Store refresh token
  await tokenModel.create(user.id, tokens.refreshToken, getRefreshTokenExpiry());

  return {
    user: userModel.toUserPublic(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  // Verify token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  // Check if token exists in DB
  const storedToken = await tokenModel.findByToken(refreshToken);
  if (!storedToken) {
    throw AppError.unauthorized('Refresh token not found');
  }

  // Check if expired
  if (new Date(storedToken.expires_at) < new Date()) {
    await tokenModel.deleteByToken(refreshToken);
    throw AppError.unauthorized('Refresh token expired');
  }

  // Delete old token
  await tokenModel.deleteByToken(refreshToken);

  // Generate new tokens
  const tokens = generateTokenPair({ userId: payload.userId, email: payload.email });

  // Store new refresh token
  await tokenModel.create(payload.userId, tokens.refreshToken, getRefreshTokenExpiry());

  return tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await tokenModel.deleteByToken(refreshToken);
}

export async function logoutAll(userId: number): Promise<void> {
  await tokenModel.deleteByUserId(userId);
}
