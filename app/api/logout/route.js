import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  const sessionId = cookies().get('sessao')?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  const response = NextResponse.json({ mensagem: 'Logout realizado com sucesso.' });
  response.cookies.set('sessao', '', { path: '/', maxAge: 0 });

  return response;
}
