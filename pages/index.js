import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { fetchArtists } from '../utils/api';
import { saveBooking, getBookings } from '../utils/storage';
import SearchBar from '../components/SearchBar';
import ArtistCard from '../components/ArtistCard';
import BookingForm from '../components/BookingForm';
import BookingSuccess from '../components/BookingSuccess';
import BookingHistory from '../components/BookingHistory';
import styles from '../styles/Home.module.css';

/**
 * Enum-like object for the different views/screens of the app
 * Objeto tipo enum para as diferentes views/telas do app
 */
const VIEWS = {
  SEARCH: 'search',
  FORM: 'form',
  SUCCESS: 'success',
  HISTORY: 'history',
};

/**
 * Home Page Component
 * Main entry point of the application. Manages the full booking flow:
 * Search → Select Artist → Fill Form → Success → History
 *
 * Componente Página Home
 * Ponto de entrada principal da aplicação. Gerencia o fluxo completo de contratação:
 * Pesquisa → Selecionar Artista → Preencher Formulário → Sucesso → Histórico
 */
export default function Home() {
  // Current view state / Estado da view atual
  const [currentView, setCurrentView] = useState(VIEWS.SEARCH);

  // Artist search results / Resultados de pesquisa de artistas
  const [artists, setArtists] = useState([]);

  // Loading state for search / Estado de carregamento para pesquisa
  const [isLoading, setIsLoading] = useState(false);

  // Currently selected artist for booking / Artista atualmente selecionado para contratação
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Last submitted booking data / Dados da última contratação submetida
  const [lastBooking, setLastBooking] = useState(null);

  // All bookings from LocalStorage / Todas as contratações do LocalStorage
  const [bookings, setBookings] = useState([]);

  /**
   * Load trending/popular artists on initial render
   * Carrega artistas em tendência/populares na renderização inicial
   */
  useEffect(() => {
    loadTrendingArtists();
  }, []);

  /**
   * Fetches trending artists (empty query returns all mock data)
   * Busca artistas em tendência (query vazia retorna todos os dados mock)
   */
  const loadTrendingArtists = async () => {
    setIsLoading(true);
    try {
      const results = await fetchArtists('');
      setArtists(results);
    } catch (error) {
      console.error('Error loading trending artists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles search input with debounce-like behavior
   * Lida com input de pesquisa com comportamento tipo debounce
   */
  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    try {
      const results = await fetchArtists(query);
      setArtists(results);
    } catch (error) {
      console.error('Error searching artists:', error);
      setArtists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handles artist selection — moves to booking form view
   * Lida com seleção de artista — move para view do formulário de contratação
   */
  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
    setCurrentView(VIEWS.FORM);
  };

  /**
   * Handles form submission — saves booking and shows success screen
   * Lida com submissão do formulário — salva contratação e mostra tela de sucesso
   */
  const handleSubmitBooking = (bookingData) => {
    // Save booking to LocalStorage / Salva contratação no LocalStorage
    const savedBooking = saveBooking(bookingData);
    setLastBooking(savedBooking);
    setCurrentView(VIEWS.SUCCESS);
  };

  /**
   * Resets state for a new booking
   * Reseta estado para uma nova contratação
   */
  const handleNewBooking = () => {
    setSelectedArtist(null);
    setLastBooking(null);
    setCurrentView(VIEWS.SEARCH);
  };

  /**
   * Loads bookings from LocalStorage and switches to history view
   * Carrega contratações do LocalStorage e muda para view de histórico
   */
  const handleViewHistory = () => {
    const allBookings = getBookings();
    setBookings(allBookings);
    setCurrentView(VIEWS.HISTORY);
  };

  /**
   * Renders the content based on the current view
   * Renderiza o conteúdo baseado na view atual
   */
  const renderContent = () => {
    switch (currentView) {
      // Search view — displays search bar and artist grid
      // View de pesquisa — exibe barra de pesquisa e grid de artistas
      case VIEWS.SEARCH:
        return (
          <>
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            {/* Results count / Contagem de resultados */}
            {!isLoading && artists.length > 0 && (
              <p className={styles.resultsCount}>
                {artists.length} artist(s) found / artista(s) encontrado(s)
              </p>
            )}

            {/* Artist grid / Grid de artistas */}
            <section className={styles.grid} aria-label="Artist results">
              {artists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  onSelect={handleSelectArtist}
                />
              ))}
            </section>

            {/* No results message / Mensagem sem resultados */}
            {!isLoading && artists.length === 0 && (
              <p className={styles.noResults}>
                No artists found. Try another search. / Nenhum artista encontrado. Tente outra pesquisa.
              </p>
            )}

            {/* View history button / Botão ver histórico */}
            <div className={styles.historyLink}>
              <button onClick={handleViewHistory} className={styles.historyBtn}>
                📋 View Booking History / Ver Histórico de Contratações
              </button>
            </div>
          </>
        );

      // Form view — displays booking form for selected artist
      // View de formulário — exibe formulário de contratação para artista selecionado
      case VIEWS.FORM:
        return (
          <BookingForm
            selectedArtist={selectedArtist}
            onSubmit={handleSubmitBooking}
            onCancel={handleNewBooking}
          />
        );

      // Success view — displays booking confirmation
      // View de sucesso — exibe confirmação de contratação
      case VIEWS.SUCCESS:
        return (
          <BookingSuccess
            booking={lastBooking}
            onNewBooking={handleNewBooking}
            onViewHistory={handleViewHistory}
          />
        );

      // History view — displays all previous bookings
      // View de histórico — exibe todas as contratações anteriores
      case VIEWS.HISTORY:
        return (
          <BookingHistory
            bookings={bookings}
            onBack={handleNewBooking}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Artist Booking Platform / Plataforma de Contratação de Artistas</title>
        <meta name="description" content="Search and book artists for private events / Pesquise e contrate artistas para eventos particulares" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.layout}>
        {/* Application header / Cabeçalho da aplicação */}
        <header className={styles.appHeader}>
          <h1 className={styles.logo} onClick={handleNewBooking} role="button" tabIndex={0}>
            🎵 ArtistBook
          </h1>
          <p className={styles.tagline}>
            Find and book artists for your events / Encontre e contrate artistas para seus eventos
          </p>
        </header>

        {/* Main content area / Área de conteúdo principal */}
        <main className={styles.main}>
          {renderContent()}
        </main>

        {/* Application footer / Rodapé da aplicação */}
        <footer className={styles.footer}>
          <p>© 2026 ArtistBook — Built by Parys-boop (Arthur)</p>
        </footer>
      </div>
    </>
  );
}