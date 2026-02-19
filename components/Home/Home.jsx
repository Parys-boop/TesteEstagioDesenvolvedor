'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SearchBar from '@/components/SearchBar/SearchBar';
import ArtistCard from '@/components/ArtistCard/ArtistCard';
import BookingForm from '@/components/BookingForm/BookingForm';
import BookingSuccess from '@/components/BookingSuccess/BookingSuccess';
import BookingHistory from '@/components/BookingHistory/BookingHistory';
import useRequireAuth from '@/hooks/useRequireAuth';
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
const PAGE_SIZE = 10;
const DEBOUNCE_MS = 350;
const FLOW_STEPS = {
  SEARCH: 'SEARCH',
  BOOKING: 'BOOKING',
  SUCCESS: 'SUCCESS',
  HISTORY: 'HISTORY',
};

const Home = () => {
  const { requireAuth } = useRequireAuth();
  // Navigation state / Estado de navegação
  const [flowStep, setFlowStep] = useState(FLOW_STEPS.SEARCH);

  // Search & artist list state / Estado de pesquisa e lista de artistas
  const [artists, setArtists] = useState([]);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, hasMore: false });
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState(null);

  // Booking state / Estado de contratação
  const [lastBooking, setLastBooking] = useState(null);
  const [bookings, setBookings] = useState([]);

  const requestIdRef = useRef(0);

  const trimmedQuery = debouncedQuery.trim();
  const isTrendingView = trimmedQuery.length === 0;
  const hasSearched = trimmedQuery.length > 0;

  // Load persisted bookings on component mount / Carrega contratações persistidas ao montar
  useEffect(() => {
    const persistedBookings = getBookings();
    setBookings(persistedBookings);
  }, []);

  // Debounce search input to reduce API calls / Debounce da pesquisa para reduzir chamadas
  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }

    const timeout = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const showTrendingArtists = useCallback((artistsList) => {
    setArtists(artistsList);
    setPagination({ offset: artistsList.length, hasMore: false });
  }, []);

  const loadTrendingArtists = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { artists: trending, error } = await fetchTrendingArtists(PAGE_SIZE);
      if (error === 'rate_limit') {
        setToast({
          type: 'error',
          message: 'Limite da Spotify atingido. Tente novamente em instantes.',
        });
        return;
      }
      setTrendingArtists(trending);
      showTrendingArtists(trending);
    } catch (error) {
      console.error('Failed to load trending artists / Falha ao carregar artistas em tendência:', error);
      setToast({
        type: 'error',
        message: 'Não foi possível carregar artistas em tendência.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [showTrendingArtists]);

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
    if (isTrendingView) {
      // If no query, show trending artists / Se sem query, mostra artistas em tendência
      setIsLoading(false);
      setIsLoadingMore(false);
      setErrorMessage(null);
      if (trendingArtists.length > 0) {
        showTrendingArtists(trendingArtists);
      } else {
        loadTrendingArtists();
      }
      return;
    }

    if (trimmedQuery.length < 2) {
      setIsLoading(false);
      setIsLoadingMore(false);
      setArtists([]);
      setPagination({ offset: 0, hasMore: false });
      setErrorMessage('Digite pelo menos 2 caracteres.');
      return;
    }

    // Mark that this is a search view, not trending / Marca que é visualização de pesquisa, não tendência
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage(null);

    const fetchPage = async () => {
      try {
        const { artists: pageArtists, hasMore: pageHasMore, nextOffset, error } = await fetchArtists({
          query: trimmedQuery,
          offset: 0,
          limit: PAGE_SIZE,
        });

        if (cancelled || requestId !== requestIdRef.current) {
          return;
        }

        if (error === 'rate_limit') {
          setArtists([]);
          setPagination({ offset: 0, hasMore: false });
          setErrorMessage('Limite da Spotify atingido. Tente novamente em instantes.');
          setToast({ type: 'error', message: 'Muitas requisições para o Spotify.' });
          return;
        }

        setArtists(pageArtists);
        setPagination({
          offset: nextOffset ?? pageArtists.length,
          hasMore: pageHasMore,
        });
      } catch (error) {
        console.error('Search error / Erro de pesquisa:', error);
        if (!cancelled) {
          setArtists([]);
          setPagination({ offset: 0, hasMore: false });
          setErrorMessage('Não foi possível carregar artistas no momento.');
          setToast({ type: 'error', message: 'Falha na busca.' });
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
  }, [isTrendingView, trimmedQuery, loadTrendingArtists, showTrendingArtists, trendingArtists]);

  /**
   * Handles search functionality
   * Lida com funcionalidade de pesquisa
   */
  const handleSearch = (value) => {
    setQuery(value);
  };

  /**
   * Loads additional pages from Spotify
   * Carrega páginas adicionais do Spotify
   */
  const handleLoadMore = async () => {
    if (isLoading || !pagination.hasMore || isLoadingMore) {
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoadingMore(true);
    try {
      const { artists: pageArtists, hasMore: pageHasMore, nextOffset, error } = await fetchArtists({
        query: trimmedQuery,
        offset: pagination.offset,
        limit: PAGE_SIZE,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (error === 'rate_limit') {
        setToast({ type: 'error', message: 'Muitas requisições para o Spotify.' });
        return;
      }

      setArtists((prev) => [...prev, ...pageArtists]);
      setPagination({
        offset: nextOffset ?? pagination.offset + pageArtists.length,
        hasMore: pageHasMore,
      });
      setToast({ type: 'success', message: 'Mais artistas carregados.' });
    } catch (error) {
      console.error('Pagination error / Erro na paginação:', error);
      setToast({ type: 'error', message: 'Não foi possível carregar mais artistas.' });
    } finally {
      setIsLoadingMore(false);
    }
  };

  /**
   * Handles artist selection by transitioning to booking view
   * Lida com seleção do artista transitando para visualização de contratação
   */
  const handleSelectArtist = async (artist) => {
    await requireAuth(() => {
      setSelectedArtist(artist);
      setFlowStep(FLOW_STEPS.BOOKING);
    });
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
      message: 'Contratação confirmada!',
    });

    // Navigate to success view / Navega para visualização de sucesso
    setFlowStep(FLOW_STEPS.SUCCESS);
  };

  /**
   * Navigates back to search view
   * Navega de volta para visualização de pesquisa
   */
  const handleBackToSearch = () => {
    setFlowStep(FLOW_STEPS.SEARCH);
    setSelectedArtist(null);
  };

  /**
   * Navigates to booking history view
   * Navega para visualização de histórico de contratações
   */
  const handleViewHistory = async () => {
    await requireAuth(() => {
      setFlowStep(FLOW_STEPS.HISTORY);
    });
  };

  /**
   * Handles new booking from success screen
   * Lida com nova contratação a partir da tela de sucesso
   */
  const handleNewBooking = () => {
    setSelectedArtist(null);
    setLastBooking(null);
    setFlowStep(FLOW_STEPS.SEARCH);
  };

  return (
    <div className={styles.container}>
      {/* Header - always visible / Header - sempre visível */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          Plataforma de contratação de artistas
        </h1>
        <p className={styles.subtitle}>
          Descubra e contrate seus artistas favoritos
        </p>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.historyButton}
            onClick={handleViewHistory}
          >
            Histórico de contratações
            {bookings.length > 0 && ` (${bookings.length})`}
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* View: Search & Results / Visualização: Pesquisa e Resultados */}
        {flowStep === FLOW_STEPS.SEARCH && (
          <>
            <SearchBar
              value={query}
              onSearch={handleSearch}
              isLoading={isLoading || isLoadingMore}
            />

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
                      ? 'Nenhum artista encontrado'
                      : 'Pesquise artistas para começar'}
                  </p>
                  {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
                </div>
              )}

              {!isLoading && artists.length > 0 && (
                <>
                  {isTrendingView && (
                    <h3 className={styles.sectionTitle}>
                      Em alta agora
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

              {pagination.hasMore && !isLoading && !isTrendingView && (
                <div className={styles.loadMoreWrapper}>
                  <button
                    type="button"
                    className={styles.loadMoreButton}
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore
                      ? 'Carregando mais'
                      : 'Carregar mais artistas'}
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        {/* View: Booking Form / Visualização: Formulário de Contratação */}
        {flowStep === FLOW_STEPS.BOOKING && selectedArtist && (
          <BookingForm
            selectedArtist={selectedArtist}
            onSubmit={handleBookingSubmit}
            onCancel={handleBackToSearch}
          />
        )}

        {/* View: Success Confirmation / Visualização: Confirmação de Sucesso */}
        {flowStep === FLOW_STEPS.SUCCESS && lastBooking && (
          <BookingSuccess
            booking={lastBooking}
            onNewBooking={handleNewBooking}
            onViewHistory={handleViewHistory}
          />
        )}

        {/* View: Booking History / Visualização: Histórico de Contratações */}
        {flowStep === FLOW_STEPS.HISTORY && (
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
            aria-label="Fechar notificação"
          >
            ?
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
