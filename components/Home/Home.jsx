'use client';

import { useState, useEffect, useMemo } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import ArtistCard from '@/components/ArtistCard/ArtistCard';
import BookingForm from '@/components/BookingForm/BookingForm';
import BookingSuccess from '@/components/BookingSuccess/BookingSuccess';
import BookingHistory from '@/components/BookingHistory/BookingHistory';
import { fetchArtists, fetchTrendingArtists } from '@/utils/api';
import { getBookings, saveBooking } from '@/utils/storage';
import styles from './Home.module.css';

/**
 * Home Component - Main page orchestrating the complete booking workflow
 * Componente Home - Página principal orquestrando o fluxo completo de contratação
 * 
 * Manages navigation between search, booking form, success confirmation,
 * and booking history views. Coordinates state and data persistence.
 * 
 * Gerencia navegação entre pesquisa, formulário de contratação, confirmação
 * de sucesso e visualizações de histórico de contratações. Coordena estado e persistência.
 */
const PAGE_SIZE = 20;
const VIEW_TYPES = {
  SEARCH: 'SEARCH',
  BOOKING: 'BOOKING',
  SUCCESS: 'SUCCESS',
  HISTORY: 'HISTORY',
};

const Home = () => {
  // Navigation state / Estado de navegação
  const [currentView, setCurrentView] = useState(VIEW_TYPES.SEARCH);
  
  // Search & artist list state / Estado de pesquisa e lista de artistas
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isTrendingView, setIsTrendingView] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Booking state / Estado de contratação
  const [lastBooking, setLastBooking] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Load persisted bookings on component mount / Carrega contratações persistidas ao montar
  useEffect(() => {
    const persistedBookings = getBookings();
    setBookings(persistedBookings);
  }, []);

  // Load trending artists on component mount / Carrega artistas em tendência ao montar
  useEffect(() => {
    const loadTrendingArtists = async () => {
      setIsLoading(true);
      try {
        const trendingArtists = await fetchTrendingArtists(PAGE_SIZE);
        setArtists(trendingArtists);
        setIsTrendingView(true);
      } catch (error) {
        console.error('Failed to load trending artists / Falha ao carregar artistas em tendência:', error);
        setToast({
          type: 'warning',
          message: 'Could not load trending artists / Não foi possível carregar artistas em tendência',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingArtists();
  }, []);

  // Toast auto-dismiss effect / Efeito auto-dismiss do toast
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
      // If no query, show trending artists / Se sem query, mostra artistas em tendência
      setIsTrendingView(true);
      return;
    }

    // Mark that this is a search view, not trending / Marca que é visualização de pesquisa, não tendência
    setIsTrendingView(false);

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
   * Handles artist selection by transitioning to booking view
   * Lida com seleção do artista transitando para visualização de contratação
   */
  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
    setCurrentView(VIEW_TYPES.BOOKING);
  };

  /**
   * Handles successful booking submission
   * Lida com envio bem-sucedido de contratação
   */
  const handleBookingSubmit = (bookingData) => {
    // Save booking to storage / Salva contratação no armazenamento
    const savedBooking = saveBooking(bookingData);
    setLastBooking(savedBooking);
    
    // Update bookings list / Atualiza lista de contratações
    setBookings((prev) => [...prev, savedBooking]);
    
    // Show success message / Mostra mensagem de sucesso
    setToast({
      type: 'success',
      message: 'Booking confirmed! / Contratação confirmada!',
    });
    
    // Navigate to success view / Navega para visualização de sucesso
    setCurrentView(VIEW_TYPES.SUCCESS);
  };

  /**
   * Navigates back to search view
   * Navega de volta para visualização de pesquisa
   */
  const handleBackToSearch = () => {
    setCurrentView(VIEW_TYPES.SEARCH);
    setSelectedArtist(null);
  };

  /**
   * Navigates to booking history view
   * Navega para visualização de histórico de contratações
   */
  const handleViewHistory = () => {
    setCurrentView(VIEW_TYPES.HISTORY);
  };

  /**
   * Handles new booking from success screen
   * Lida com nova contratação a partir da tela de sucesso
   */
  const handleNewBooking = () => {
    setSelectedArtist(null);
    setLastBooking(null);
    setCurrentView(VIEW_TYPES.SEARCH);
  };

  return (
    <div className={styles.container}>
      {/* Header - always visible / Header - sempre visível */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          Artist Booking Platform / Plataforma de Contratação de Artistas
        </h1>
        <p className={styles.subtitle}>
          Discover and book your favorite artists / Descubra e contrate seus artistas favoritos
        </p>
      </header>

      <main className={styles.main}>
        {/* View: Search & Results / Visualização: Pesquisa e Resultados */}
        {currentView === VIEW_TYPES.SEARCH && (
          <>
            <SearchBar onSearch={handleSearch} isLoading={isLoading || isLoadingMore} />

            <section className={styles.results}>
              {isLoading && (
                <div className={styles.skeletonGrid} aria-hidden="true">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={styles.skeletonCard} />
                  ))}
                </div>
              )}

              {!isLoading && artists.length === 0 && !isTrendingView && (
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
                <>
                  {isTrendingView && (
                    <h3 className={styles.sectionTitle}>
                      🔥 Trending Now / Tendência Agora
                    </h3>
                  )}
                  <div className={styles.grid}>
                    {artists.map((artist) => (
                      <ArtistCard
                        key={artist.id}
                        artist={artist}
                        onSelect={handleSelectArtist}
                      />
                    ))}
                  </div>
                </>
              )}

              {hasMore && !isLoading && !isTrendingView && (
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
          </>
        )}

        {/* View: Booking Form / Visualização: Formulário de Contratação */}
        {currentView === VIEW_TYPES.BOOKING && selectedArtist && (
          <BookingForm
            selectedArtist={selectedArtist}
            onSubmit={handleBookingSubmit}
            onCancel={handleBackToSearch}
          />
        )}

        {/* View: Success Confirmation / Visualização: Confirmação de Sucesso */}
        {currentView === VIEW_TYPES.SUCCESS && lastBooking && (
          <BookingSuccess
            booking={lastBooking}
            onNewBooking={handleNewBooking}
            onViewHistory={handleViewHistory}
          />
        )}

        {/* View: Booking History / Visualização: Histórico de Contratações */}
        {currentView === VIEW_TYPES.HISTORY && (
          <BookingHistory
            bookings={bookings}
            onBack={handleBackToSearch}
          />
        )}
      </main>

      {/* Toast notifications - always available / Notificações toast - sempre disponíveis */}
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