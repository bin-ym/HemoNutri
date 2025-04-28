export interface AuthResponse {
  token: string;
  role: string;
  userId: string;
  isFirstLogin: boolean;
  error?: string; // Optional field for error messages from backend
  message?: string; // Optional field for success/error messages
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}
