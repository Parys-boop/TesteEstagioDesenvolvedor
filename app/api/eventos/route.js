import { NextResponse } from 'next/server';

const isFutureDate = (dateValue) => {
  const selectedDate = new Date(dateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate > today;
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { titulo, data, local, artistaIds } = body || {};

    if (!titulo || !titulo.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório.' }, { status: 400 });
    }

    if (!data || !isFutureDate(data)) {
      return NextResponse.json({ error: 'Data do evento deve ser futura.' }, { status: 400 });
    }

    if (!Array.isArray(artistaIds) || artistaIds.length === 0) {
      return NextResponse.json({ error: 'Informe pelo menos um artista.' }, { status: 400 });
    }

    const evento = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      titulo: titulo.trim(),
      data,
      local: (local || '').trim(),
      artistaIds,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ evento }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao processar evento.' }, { status: 500 });
  }
}
