'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AuthModal from '@/components/AuthModal/AuthModal';
import { getMe, login as apiLogin, logout as apiLogout } from '@/utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [loginAberto, setLoginAberto] = useState(false);
  const pendingActionRef = useRef(null);
  const pendingResolveRef = useRef(null);

  const verificarSessao = useCallback(async () => {
    try {
      const me = await getMe();
      if (me?.usuario) {
        setUsuario(me.usuario);
        return true;
      }
      setUsuario(null);
      return false;
    } catch (error) {
      console.error('Falha ao verificar sessao:', error);
      setUsuario(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    const carregarSessao = async () => {
      setCarregando(true);
      await verificarSessao();
      if (ativo) {
        setCarregando(false);
      }
    };

    carregarSessao();

    return () => {
      ativo = false;
    };
  }, [verificarSessao]);

  const abrirLogin = useCallback((action, resolver) => {
    pendingActionRef.current = action ?? null;
    pendingResolveRef.current = resolver ?? null;
    setLoginAberto(true);
  }, []);

  const fecharLogin = useCallback(() => {
    setLoginAberto(false);
    const resolver = pendingResolveRef.current;
    pendingResolveRef.current = null;
    resolver?.(false);
  }, []);

  const handleLogin = useCallback(async (email, senha) => {
    const result = await apiLogin({ email, senha });

    if (result?.usuario) {
      setUsuario(result.usuario);
      setLoginAberto(false);

      const action = pendingActionRef.current;
      pendingActionRef.current = null;

      const resolver = pendingResolveRef.current;
      pendingResolveRef.current = null;

      action?.();
      resolver?.(true);

      return { ok: true };
    }

    return {
      ok: false,
      mensagem: result?.erro?.mensagem ?? 'Falha ao autenticar.',
    };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        carregando,
        verificarSessao,
        abrirLogin,
        fecharLogin,
        logout,
      }}
    >
      {children}
      <AuthModal
        isOpen={loginAberto}
        onClose={fecharLogin}
        onSubmit={handleLogin}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
