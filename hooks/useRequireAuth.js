import { useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider/AuthProvider';

const useRequireAuth = () => {
  const { usuario, carregando, verificarSessao, abrirLogin } = useAuth();

  const requireAuth = useCallback(
    async (action) => {
      if (!usuario) {
        const ok = await verificarSessao();
        if (ok) {
          action?.();
          return true;
        }
      }

      if (usuario) {
        action?.();
        return true;
      }

      return new Promise((resolve) => {
        abrirLogin(action, resolve);
      });
    },
    [usuario, verificarSessao, abrirLogin]
  );

  return { requireAuth, usuario, carregando };
};

export default useRequireAuth;
