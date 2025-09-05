'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });
  const router = useRouter();

  useEffect(() => {
    // Verificar se há token no localStorage
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');

    if (token && user) {
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
    window.location.href = '/login';
  };

  return {
    ...authState,
    logout
  };
}
