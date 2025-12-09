export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  currency: string;
  profileImageUrl: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
