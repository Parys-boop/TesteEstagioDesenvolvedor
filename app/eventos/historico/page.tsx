'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventosHistoricoPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let active = true;

    const loadEventos = async () => {
      try {
        const response = await fetch('/api/eventos');
        const data = await response.json().catch(() => ({}));

        if (!active) return;

        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!response.ok) {
          setErro(data?.erro?.mensagem || 'Nao foi possivel carregar seus eventos.');
          return;
        }

        setEventos(Array.isArray(data?.eventos) ? data.eventos : []);
      } catch (error) {
        if (!active) return;
        setErro('Nao foi possivel carregar seus eventos.');
      } finally {
        if (active) {
          setCarregando(false);
        }
      }
    };

    loadEventos();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <section aria-label="Meus eventos">
      <header>
        <h1>Meus eventos</h1>
        <p>Acompanhe os eventos que voce criou.</p>
      </header>

      {carregando && <p>Carregando eventos...</p>}

      {!carregando && erro && <p role="alert">{erro}</p>}

      {!carregando && !erro && eventos.length === 0 && (
        <p>Nenhum evento encontrado.</p>
      )}

      {!carregando && !erro && eventos.length > 0 && (
        <ul>
          {eventos.map((evento) => (
            <li key={evento.id}>
              <strong>{evento.titulo}</strong>
              <div>Data: {new Date(evento.data).toLocaleDateString('pt-BR')}</div>
              <div>Local: {evento.local || 'Nao informado'}</div>
              <div>Artistas: {Array.isArray(evento.artistaIds) ? evento.artistaIds.length : 0}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
