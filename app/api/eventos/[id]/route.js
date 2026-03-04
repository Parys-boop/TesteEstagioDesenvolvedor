import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/authOptions';
import clientPromise from '@/lib/mongodb';

const isFutureDate = (dateValue) => {
  const selectedDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today;
};

const getSessionUserId = (session) => session?.user?.id || null;

const parseObjectId = (value) => {
  if (!value || !ObjectId.isValid(value)) {
    return null;
  }
  return new ObjectId(value);
};

export async function PUT(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json(
        { erro: { mensagem: 'Usuario nao autenticado.' } },
        { status: 401 }
      );
    }

    const resolvedParams = await context.params;
    const eventId = parseObjectId(resolvedParams?.id);
    if (!eventId) {
      return NextResponse.json(
        { erro: { mensagem: 'Evento invalido.' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { titulo, data, local } = body || {};

    if (!titulo || !titulo.trim()) {
      return NextResponse.json(
        { erro: { mensagem: 'Titulo e obrigatorio.' } },
        { status: 400 }
      );
    }

    if (!data || !isFutureDate(data)) {
      return NextResponse.json(
        { erro: { mensagem: 'Data do evento deve ser futura.' } },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const eventosCollection = db.collection('eventos');

    const update = {
      titulo: titulo.trim(),
      data,
      local: (local || '').trim(),
      updatedAt: new Date().toISOString(),
    };

    const result = await eventosCollection.updateOne(
      { _id: eventId, userId },
      { $set: update }
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { erro: { mensagem: 'Evento nao encontrado.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      mensagem: 'Evento atualizado com sucesso.',
      evento: {
        id: eventId.toString(),
        ...update,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      { erro: { mensagem: 'Erro ao atualizar evento.' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json(
        { erro: { mensagem: 'Usuario nao autenticado.' } },
        { status: 401 }
      );
    }

    const resolvedParams = await context.params;
    const eventId = parseObjectId(resolvedParams?.id);
    if (!eventId) {
      return NextResponse.json(
        { erro: { mensagem: 'Evento invalido.' } },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const eventosCollection = db.collection('eventos');

    const result = await eventosCollection.deleteOne({ _id: eventId, userId });

    if (!result.deletedCount) {
      return NextResponse.json(
        { erro: { mensagem: 'Evento nao encontrado.' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ mensagem: 'Evento removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    return NextResponse.json(
      { erro: { mensagem: 'Erro ao remover evento.' } },
      { status: 500 }
    );
  }
}
