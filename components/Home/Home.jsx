'use client';

import { useState, useEffect, useMemo } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import ArtistCard from '@/components/ArtistCard/ArtistCard';
import { fetchArtists } from '@/utils/api';
import styles from './Home.module.css';

/**
 * Home Component - Main page for artist search
 * Componente Home - Página principal para pesquisa de artistas
 * 
 * Integrates SearchBar and ArtistCard components to provide a complete
 * artist discovery and booking workflow
 * 
 * Integra componentes SearchBar e ArtistCard para fornecer um fluxo
 * completo de descoberta e contratação de artistas
 */
const PAGE_SIZE = 20;

const Home = () => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);

  /**
   * Effect to fetch artists whenever the active query changes
   * Efeito para buscar artistas sempre que a busca ativa muda
   */
  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setArtists([]);
      setHasMore(false);
      setOffset(0);
      setErrorMessage(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setErrorMessage(null);

    const fetchPage = async () => {
      try {
        const { artists: pageArtists, hasMore: pageHasMore, nextOffset } = await fetchArtists({
          query: trimmedQuery,
          offset: 0,
          limit: PAGE_SIZE,
        });

        if (cancelled) {
          return;
        }

        setArtists(pageArtists);
        setHasMore(pageHasMore);
        setOffset(nextOffset ?? pageArtists.length);
      } catch (error) {
        console.error('Search error / Erro de pesquisa:', error);
        if (!cancelled) {
          setArtists([]);
          setHasMore(false);
          setOffset(0);
          setErrorMessage('Unable to load artists right now / Não foi possível carregar artistas no momento');
          setToast({ type: 'error', message: 'Search failed / Falha na busca' });
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [query]);

  /**
   * Handles search functionality
   * Lida com funcionalidade de pesquisa
   */
  const handleSearch = (value) => {
    setHasSearched(value.trim().length > 0);
    setQuery(value);
  };

  /**
   * Loads additional pages from Spotify
   * Carrega páginas adicionais do Spotify
   */
  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const { artists: pageArtists, hasMore: pageHasMore, nextOffset } = await fetchArtists({
        query: query.trim(),
        offset,
        limit: PAGE_SIZE,
      });

      setArtists((prev) => [...prev, ...pageArtists]);
      setHasMore(pageHasMore);
      setOffset(nextOffset ?? offset + pageArtists.length);
      setToast({ type: 'success', message: 'Loaded more artists / Mais artistas carregados' });
    } catch (error) {
      console.error('Pagination error / Erro na paginação:', error);
      setToast({ type: 'error', message: 'Could not load more artists / Não foi possível carregar mais artistas' });
    } finally {
      setIsLoadingMore(false);
    }
  };

  /**
   * Handles artist selection
   * Lida com seleção do artista
   */
  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
    // Navigate to booking form would go here
    // Navegação para formulário de contratação iria aqui
    console.log('Selected artist / Artista selecionado:', artist);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Artist Booking Platform / Plataforma de Contratação de Artistas
        </h1>
        <p className={styles.subtitle}>
          Discover and book your favorite artists / Descubra e contrate seus artistas favoritos
        </p>
      </header>

      <main className={styles.main}>
        <SearchBar onSearch={handleSearch} isLoading={isLoading || isLoadingMore} />

        {selectedArtist && (
          <section className={styles.selectedArtist}>
            <button 
              onClick={() => setSelectedArtist(null)}
              className={styles.closeButton}
              aria-label="Close artist selection"
            >
              ✕
            </button>
            <h2>Selected Artist / Artista Selecionado</h2>
            <p><strong>Name / Nome:</strong> {selectedArtist.name}</p>
            <p><strong>Genre / Gênero:</strong> {selectedArtist.genre}</p>
            <button className={styles.bookingButton}>
              Proceed to Booking Form / Ir para Formulário de Contratação
            </button>
          </section>
        )}

        <section className={styles.results}>
          {isLoading && (
            <div className={styles.skeletonGrid} aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={styles.skeletonCard} />
              ))}
            </div>
          )}

          {!isLoading && artists.length === 0 && (
            <div className={styles.noResults}>
              <p>
                {hasSearched
                  ? 'No artists found / Nenhum artista encontrado'
                  : 'Search for artists to get started / Pesquise artistas para começar'}
              </p>
              {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
            </div>
          )}

          {!isLoading && artists.length > 0 && (
            <div className={styles.grid}>
              {artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onSelect={handleSelectArtist}
                />
              ))}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className={styles.loadMoreWrapper}>
              <button
                type="button"
                className={styles.loadMoreButton}
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore
                  ? 'Loading more / Carregando mais'
                  : 'Load more artists / Carregar mais artistas'}
              </button>
            </div>
          )}
        </section>
      </main>

      {toast && (
        <div
          className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
          role="status"
        >
          {toast.message}
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;