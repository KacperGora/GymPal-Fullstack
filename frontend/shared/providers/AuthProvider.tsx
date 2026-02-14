'use client';

import { useEffect, type ReactNode } from 'react';

import { useMe } from '@/features/auth/queries/useMe';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/shared/stores/auth.store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
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

  // Listen for navigation to login event from axios interceptor
  useEffect(() => {
    const handleNavigateToLogin = () => {
      router.replace('/login');
    };

    window.addEventListener('navigateToLogin', handleNavigateToLogin);

    return () => {
      window.removeEventListener('navigateToLogin', handleNavigateToLogin);
    };
  }, [router]);

  return <>{children}</>;
}
