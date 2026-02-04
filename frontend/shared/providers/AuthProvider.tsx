'use client';

import { useEffect, type ReactNode } from 'react';

import { useMe } from '@/features/auth/queries/useMe';
import { useAuthStore } from '@/shared/stores/auth.store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: user, isLoading, isError } = useMe();
  const { setUser, clearUser, setHydrated } = useAuthStore();

  useEffect(() => {
    if (user) {
      setUser(user);
    } else if (isError) {
      clearUser();
    }

    if (!isLoading) {
      setHydrated();
    }
  }, [user, isLoading, isError, setUser, clearUser, setHydrated]);

  return <>{children}</>;
}
