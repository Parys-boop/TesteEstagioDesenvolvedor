'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
};

export default function EventosHistoricoPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [formEdicao, setFormEdicao] = useState({
    titulo: '',
    data: '',
    local: '',
  });
  const [acaoId, setAcaoId] = useState(null);

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

  const iniciarEdicao = (evento) => {
    setEditandoId(evento.id);
    setFormEdicao({
      titulo: evento.titulo || '',
      data: evento.data ? String(evento.data).slice(0, 10) : '',
      local: evento.local || '',
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setFormEdicao({ titulo: '', data: '', local: '' });
  };

  const salvarEdicao = async (eventoId) => {
    try {
      setAcaoId(eventoId);
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: formEdicao.titulo,
          data: formEdicao.data,
          local: formEdicao.local,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        setErro(data?.erro?.mensagem || 'Nao foi possivel atualizar o evento.');
        return;
      }

      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === eventoId
            ? { ...evento, ...data.evento, titulo: formEdicao.titulo, data: formEdicao.data, local: formEdicao.local }
            : evento
        )
      );
      cancelarEdicao();
    } catch (error) {
      setErro('Nao foi possivel atualizar o evento.');
    } finally {
      setAcaoId(null);
    }
  };

  const excluirEvento = async (eventoId) => {
    const confirmar = window.confirm('Deseja realmente excluir este evento?');
    if (!confirmar) {
      return;
    }

    try {
      setAcaoId(eventoId);
      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        setErro(data?.erro?.mensagem || 'Nao foi possivel remover o evento.');
        return;
      }

      setEventos((prev) => prev.filter((evento) => evento.id !== eventoId));
    } catch (error) {
      setErro('Nao foi possivel remover o evento.');
    } finally {
      setAcaoId(null);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1>Meus eventos</h1>
          <p>Acompanhe os eventos que voce criou.</p>
        </header>

        {carregando && <p className={styles.helper}>Carregando eventos...</p>}

        {!carregando && erro && <p className={styles.error}>{erro}</p>}

        {!carregando && !erro && eventos.length === 0 && (
          <p className={styles.helper}>Nenhum evento encontrado.</p>
        )}

        {!carregando && !erro && eventos.length > 0 && (
          <div className={styles.list}>
            {eventos.map((evento) => {
              const isEditando = editandoId === evento.id;
              const artistas = Array.isArray(evento.artistas) ? evento.artistas : [];

              return (
                <div key={evento.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div>
                      {isEditando ? (
                        <input
                          className={styles.input}
                          value={formEdicao.titulo}
                          onChange={(event) =>
                            setFormEdicao((prev) => ({ ...prev, titulo: event.target.value }))
                          }
                        />
                      ) : (
                        <h3 className={styles.cardTitle}>{evento.titulo}</h3>
                      )}
                      <p className={styles.cardMeta}>
                        Data: {isEditando ? (
                          <input
                            className={styles.input}
                            type="date"
                            value={formEdicao.data}
                            onChange={(event) =>
                              setFormEdicao((prev) => ({ ...prev, data: event.target.value }))
                            }
                          />
                        ) : (
                          formatDate(evento.data)
                        )}
                      </p>
                      <p className={styles.cardMeta}>
                        Local: {isEditando ? (
                          <input
                            className={styles.input}
                            value={formEdicao.local}
                            onChange={(event) =>
                              setFormEdicao((prev) => ({ ...prev, local: event.target.value }))
                            }
                            placeholder="Nao informado"
                          />
                        ) : (
                          evento.local || 'Nao informado'
                        )}
                      </p>
                    </div>

                    <div className={styles.actions}>
                      {isEditando ? (
                        <>
                          <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={() => salvarEdicao(evento.id)}
                            disabled={acaoId === evento.id}
                          >
                            {acaoId === evento.id ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button type="button" className={styles.secondaryButton} onClick={cancelarEdicao}>
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => iniciarEdicao(evento)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.dangerButton}
                            onClick={() => excluirEvento(evento.id)}
                            disabled={acaoId === evento.id}
                          >
                            {acaoId === evento.id ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {artistas.length > 0 ? (
                    <div className={styles.artists}>
                      {artistas.map((artist) => (
                        <div key={artist.id} className={styles.artistCard}>
                          {artist.image && (
                            <img
                              src={artist.image}
                              alt={`Foto de ${artist.name}`}
                              className={styles.artistImage}
                            />
                          )}
                          <div>
                            <strong className={styles.artistName}>{artist.name}</strong>
                            {artist.genre && <small className={styles.artistGenre}>{artist.genre}</small>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.helper}>
                      Artistas: {Array.isArray(evento.artistaIds) ? evento.artistaIds.length : 0}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
