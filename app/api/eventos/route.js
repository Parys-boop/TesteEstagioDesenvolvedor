import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import clientPromise from '@/lib/mongodb';

const isFutureDate = (dateValue) => {
  const selectedDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today;
};

const getSessionUserId = (session) => session?.user?.id || null;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json(
        { erro: { mensagem: 'Usuario nao autenticado.' } },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const eventosCollection = db.collection('eventos');

    const eventos = await eventosCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    const eventosFormatados = eventos.map((evento) => ({
      id: evento._id.toString(),
      titulo: evento.titulo,
      data: evento.data,
      local: evento.local,
      artistaIds: evento.artistaIds,
      artistas: Array.isArray(evento.artistas) ? evento.artistas : [],
      userId: evento.userId,
      createdAt: evento.createdAt,
    }));

    return NextResponse.json({ eventos: eventosFormatados });
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return NextResponse.json(
      { erro: { mensagem: 'Erro ao listar eventos.' } },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = getSessionUserId(session);

    if (!userId) {
      return NextResponse.json(
        { erro: { mensagem: 'Usuario nao autenticado.' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { titulo, data, local, artistaIds, artistas } = body || {};

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

    const artistasSanitizados = Array.isArray(artistas)
      ? artistas
          .filter((artist) => artist && artist.id)
          .map((artist) => ({
            id: String(artist.id),
            name: artist.name || 'Artista',
            image: artist.image || null,
            genre: artist.genre || null,
          }))
      : [];

    const artistaIdsNormalizados = Array.isArray(artistaIds) && artistaIds.length > 0
      ? artistaIds.map((id) => String(id))
      : artistasSanitizados.map((artist) => artist.id);

    if (!Array.isArray(artistaIdsNormalizados) || artistaIdsNormalizados.length === 0) {
      return NextResponse.json(
        { erro: { mensagem: 'Informe pelo menos um artista.' } },
        { status: 400 }
      );
    }

    const evento = {
      titulo: titulo.trim(),
      data,
      local: (local || '').trim(),
      artistaIds: artistaIdsNormalizados,
      artistas: artistasSanitizados,
      userId,
      createdAt: new Date().toISOString(),
    };

    const client = await clientPromise;
    const db = client.db();
    const eventosCollection = db.collection('eventos');
    const result = await eventosCollection.insertOne(evento);

    return NextResponse.json(
      {
        mensagem: 'Evento salvo com sucesso.',
        evento: {
          id: result.insertedId.toString(),
          ...evento,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao processar evento:', error);
    return NextResponse.json(
      { erro: { mensagem: 'Erro ao processar evento.' } },
      { status: 500 }
    );
  }
}
