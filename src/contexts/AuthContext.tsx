import React, { useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { User } from '../api/auth';
import { createRequiredContext } from '../utils/createRequiredContext';

const TOKEN_KEY = 'authToken';

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const [AuthContext, useAuth] =
  createRequiredContext<AuthContextType>('AuthProvider');

export { useAuth };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);

      return;
    }

    authApi
      .getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const startSession = (result: { token: string; user: User }) => {
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setUser(result.user);
  };

  const login = async (email: string, password: string) => {
    startSession(await authApi.login(email, password));
  };

  const register = async (email: string, password: string, name: string) => {
    startSession(await authApi.register(email, password, name));
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
