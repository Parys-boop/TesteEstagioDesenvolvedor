import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
  const sessionId = cookies().get('sessao')?.value;

  if (!sessionId) {
    return NextResponse.json(
      { usuario: null, erro: { mensagem: 'Nao autenticado.' } },
      { status: 401 }
    );
  }

  const user = getUserFromSession(sessionId);

  if (!user) {
    return NextResponse.json(
      { usuario: null, erro: { mensagem: 'Sessao invalida.' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    usuario: {
      id: user.id,
      nome: user.nome,
      email: user.email,
    },
  });
}
