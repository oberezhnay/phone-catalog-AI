import { http } from './http';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthResponse {
  user: User;
  token: string;
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  return http<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string): Promise<User> {
  return http<User>('/auth/me', { token });
}
