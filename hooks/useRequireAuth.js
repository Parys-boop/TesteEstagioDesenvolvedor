'use client';

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const useRequireAuth = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const requireAuth = useCallback(
    async (action) => {
      if (status === 'loading') {
        return false;
      }

      if (!isAuthenticated) {
        router.push('/auth/login');
        return false;
      }

      action?.();
      return true;
    },
    [status, isAuthenticated, router]
  );

  return { requireAuth, status, session, isAuthenticated };
};

export default useRequireAuth;
