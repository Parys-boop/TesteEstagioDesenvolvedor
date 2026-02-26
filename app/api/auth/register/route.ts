import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json();

    if (!nome?.trim() || !email?.trim() || !senha) {
      return NextResponse.json(
        { erro: { mensagem: 'Nome, e-mail e senha sao obrigatorios.' } },
        { status: 400 }
      );
    }

    if (String(senha).trim().length < 6) {
      return NextResponse.json(
        { erro: { mensagem: 'Senha deve ter pelo menos 6 caracteres.' } },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const usuarios = db.collection('users');

    const emailNormalizado = String(email).trim().toLowerCase();
    const existente = await usuarios.findOne({ email: emailNormalizado });

    if (existente) {
      return NextResponse.json(
        { erro: { mensagem: 'Este e-mail ja esta cadastrado.' } },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(String(senha), 10);

    const result = await usuarios.insertOne({
      nome: String(nome).trim(),
      email: emailNormalizado,
      senhaHash,
      criadoEm: new Date(),
    });

    return NextResponse.json(
      {
        mensagem: 'Usuario criado com sucesso.',
        usuario: {
          id: result.insertedId.toString(),
          nome: String(nome).trim(),
          email: emailNormalizado,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao criar usuario:', error);
    return NextResponse.json(
      { erro: { mensagem: 'Nao foi possivel criar o usuario.' } },
      { status: 500 }
    );
  }
}
