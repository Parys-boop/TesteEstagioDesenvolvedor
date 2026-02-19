import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const users = [
  {
    id: 'user_demo',
    nome: 'Usuario Demo',
    email: 'demo@exemplo.com',
    senhaHash: bcrypt.hashSync('123456', 10),
  },
];

const sessionsStore = globalThis.__sessionsStore ?? new Map();
globalThis.__sessionsStore = sessionsStore;

export const getUserByEmail = (email) =>
  users.find((user) => user.email.toLowerCase() === email.toLowerCase());

export const createSession = (userId) => {
  const id = randomUUID();
  const session = { id, userId, createdAt: Date.now() };
  sessionsStore.set(id, session);
  return session;
};

export const getUserFromSession = (sessionId) => {
  const session = sessionsStore.get(sessionId);
  if (!session) return null;
  return users.find((user) => user.id === session.userId) ?? null;
};

export const deleteSession = (sessionId) => {
  sessionsStore.delete(sessionId);
};
