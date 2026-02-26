'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar/SearchBar';
import { fetchArtists } from '@/utils/api';
import styles from './page.module.css';

const SEARCH_LIMIT = 6;
const DEBOUNCE_MS = 350;

const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

export default function CreateEventPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [artistaQuery, setArtistaQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState(null);

  const selectedIds = useMemo(
    () => new Set(selectedArtists.map((artist) => artist.id)),
    [selectedArtists]
  );

  useEffect(() => {
    if (!artistaQuery.trim()) {
      setDebouncedQuery('');
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => setDebouncedQuery(artistaQuery), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [artistaQuery]);

  useEffect(() => {
    let active = true;

    const loadArtists = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const response = await fetchArtists({
        query: debouncedQuery.trim(),
        offset: 0,
        limit: SEARCH_LIMIT,
      });

      if (!active) return;

      if (response.error === 'rate_limit') {
        setToast({
          type: 'error',
          message: 'Limite da Spotify atingido. Tente novamente em instantes.',
        });
        setSearchResults([]);
      } else {
        setSearchResults(response.artists || []);
      }
      setIsSearching(false);
    };

    loadArtists();

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleAddArtist = (artist) => {
    if (selectedIds.has(artist.id)) {
      return;
    }
    setSelectedArtists((prev) => [...prev, artist]);
    setArtistaQuery('');
    setSearchResults([]);
  };

  const handleRemoveArtist = (artistId) => {
    setSelectedArtists((prev) => prev.filter((artist) => artist.id !== artistId));
  };

  const validateForm = () => {
    if (!titulo.trim()) {
      return 'Informe o título do evento.';
    }
    if (!data) {
      return 'Informe a data do evento.';
    }
    const selectedDate = new Date(data);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      return 'A data do evento deve ser futura.';
    }
    if (selectedArtists.length === 0) {
      return 'Adicione pelo menos um artista.';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setFormError('');
    setIsSaving(true);

    const payload = {
      titulo: titulo.trim(),
      data,
      local: local.trim(),
      artistaIds: selectedArtists.map((artist) => artist.id),
    };

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const dataResponse = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }

      if (!response.ok) {
        const mensagem = dataResponse?.erro?.mensagem || 'Nao foi possivel salvar o evento.';
        setToast({ type: 'error', message: mensagem });
        return;
      }

      setToast({
        type: 'success',
        message: dataResponse?.mensagem || 'Evento salvo com sucesso.',
      });
      setTitulo('');
      setData('');
      setLocal('');
      setSelectedArtists([]);
      setArtistaQuery('');
      setSearchResults([]);
    } catch (error) {
      setToast({ type: 'error', message: 'Nao foi possivel salvar o evento.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1>Criar evento</h1>
          <p>Adicione artistas e detalhes para organizar seu evento.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="titulo">Título do evento *</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex: Festa de aniversário"
              required
            />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="data">Data do evento *</label>
              <input
                id="data"
                type="date"
                min={getMinDate()}
                value={data}
                onChange={(event) => setData(event.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="local">Local</label>
              <input
                id="local"
                type="text"
                value={local}
                onChange={(event) => setLocal(event.target.value)}
                placeholder="Ex: Espaço de eventos"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Buscar artistas *</label>
            <div className={styles.searchWrapper}>
              <SearchBar
                value={artistaQuery}
                onSearch={setArtistaQuery}
                isLoading={isSearching}
              />
              {debouncedQuery.trim().length >= 2 && (
                <div className={styles.dropdown}>
                  {searchResults.length === 0 && !isSearching && (
                    <p className={styles.dropdownMessage}>Nenhum artista encontrado.</p>
                  )}
                  {searchResults.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => handleAddArtist(artist)}
                      disabled={selectedIds.has(artist.id)}
                    >
                      <span>{artist.name}</span>
                      <small>{artist.genre}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.selectedSection}>
            <h3>Artistas selecionados</h3>
            {selectedArtists.length === 0 ? (
              <p className={styles.helperText}>Nenhum artista adicionado.</p>
            ) : (
              <div className={styles.selectedGrid}>
                {selectedArtists.map((artist) => (
                  <div key={artist.id} className={styles.selectedCard}>
                    <div>
                      <strong>{artist.name}</strong>
                      <span>{artist.genre}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveArtist(artist.id)}
                      aria-label={`Remover ${artist.name}`}
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && <p className={styles.error}>{formError}</p>}

          <button type="submit" className={styles.submitButton} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar evento'}
          </button>
        </form>
      </main>

      {toast && (
        <div
          className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
          role="status"
        >
          {toast.message}
          <button type="button" onClick={() => setToast(null)} aria-label="Fechar notificação">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
