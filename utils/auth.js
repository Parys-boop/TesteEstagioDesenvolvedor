export const getMe = async () => {
  try {
    const response = await fetch('/api/usuarios/me', { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Erro ao carregar sessao:', error);
    return null;
  }
};

export const login = async ({ email, senha }) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  return response.json();
};

export const logout = async () => {
  await fetch('/api/logout', { method: 'POST' });
};
