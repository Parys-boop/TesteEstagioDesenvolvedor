import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

type AuthUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
};

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/login' },
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    'dev-only-auth-secret-change-in-production',
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const senha = credentials?.senha;

        if (!email || !senha) {
          throw new Error('E-mail e senha sao obrigatorios.');
        }

        const client = await clientPromise;
        const db = client.db();
        const usuario = await db.collection('users').findOne({ email });

        if (!usuario?.senhaHash) {
          throw new Error('Credenciais invalidas.');
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

        if (!senhaValida) {
          throw new Error('Credenciais invalidas.');
        }

        return {
          id: usuario._id.toString(),
          name: usuario.nome ?? usuario.name ?? usuario.email,
          email: usuario.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.mensagemSucesso = 'Login realizado com sucesso.';
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & { id?: string };
        sessionUser.id = token.id as string;
        sessionUser.name = token.name as string;
        sessionUser.email = token.email as string;
      }

      const sessionWithMessage = session as typeof session & { mensagemSucesso?: string };
      if (token.mensagemSucesso) {
        sessionWithMessage.mensagemSucesso = token.mensagemSucesso as string;
      }

      return session;
    },
  },
};
