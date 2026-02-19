import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createSession, getUserByEmail } from '@/lib/auth';

export async function POST(request) {
  const { email, senha } = await request.json();

  if (!email || !senha) {
    return NextResponse.json(
      { erro: { mensagem: 'E-mail e senha sao obrigatorios.' } },
      { status: 400 }
    );
  }

  const user = getUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { erro: { mensagem: 'Credenciais invalidas.' } },
      { status: 401 }
    );
  }

  const senhaOk = await bcrypt.compare(senha, user.senhaHash);

  if (!senhaOk) {
    return NextResponse.json(
      { erro: { mensagem: 'Credenciais invalidas.' } },
      { status: 401 }
    );
  }

  const session = createSession(user.id);

  const response = NextResponse.json({
    mensagem: 'Login realizado com sucesso.',
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
    },
  });

  response.cookies.set('sessao', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
