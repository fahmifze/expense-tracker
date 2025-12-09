import api, { setTokens, clearTokens, getRefreshToken } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

export async function login(data: LoginRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const response = await api.post<AuthResponse>('/auth/login', data);
  const { user, accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return { user, accessToken, refreshToken };
}

export async function register(data: RegisterRequest): Promise<{ user: User; accessToken: string; refreshToken: string }> {
  const response = await api.post<AuthResponse>('/auth/register', data);
  const { user, accessToken, refreshToken } = response.data.data;
  setTokens(accessToken, refreshToken);
  return { user, accessToken, refreshToken };
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore errors - we're logging out anyway
    }
  }
  clearTokens();
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<{ success: boolean; data: User }>('/users/me');
    return response.data.data;
  } catch {
    return null;
  }
}
