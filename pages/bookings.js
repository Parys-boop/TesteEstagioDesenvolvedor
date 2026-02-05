import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getBookings } from '../utils/storage';
import BookingHistory from '../components/BookingHistory';
import styles from '../styles/Home.module.css';

/**
 * Bookings Page Component
 * Standalone page for viewing booking history
 *
 * Componente Página de Contratações
 * Página standalone para visualizar histórico de contratações
 */
export default function BookingsPage() {
  const router = useRouter();

  // Initialize bookings directly from LocalStorage
  // Inicializa contratações diretamente do LocalStorage
  const [bookings] = useState(() => getBookings());

  /**
   * Navigate back to the home/search page
   * Navega de volta para a página home/pesquisa
   */
  const handleBack = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Booking History / Histórico de Contratações — ArtistBook</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.layout}>
        {/* Application header / Cabeçalho da aplicação */}
        <header className={styles.appHeader}>
          <h1 className={styles.logo} onClick={handleBack} role="button" tabIndex={0}>
            🎵 ArtistBook
          </h1>
          <p className={styles.tagline}>
            Find and book artists for your events / Encontre e contrate artistas para seus eventos
          </p>
        </header>

        {/* Main content area / Área de conteúdo principal */}
        <main className={styles.main}>
          <BookingHistory bookings={bookings} onBack={handleBack} />
        </main>

        {/* Application footer / Rodapé da aplicação */}
        <footer className={styles.footer}>
          <p>© 2026 ArtistBook — Built by Parys-boop (Arthur)</p>
        </footer>
      </div>
    </>
  );
}