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
const Home = () => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  /**
   * Initialize with trending artists on component mount
   * Inicializa com artistas em tendência ao montar o componente
   */
  useEffect(() => {
    const loadTrendingArtists = async () => {
      setIsLoading(true);
      try {
        // Fetch all artists as trending (since API doesn't have dedicated trending endpoint)
        // Busca todos os artistas como em tendência (já que API não tem endpoint dedicado)
        const data = await fetchArtists('');
        setArtists(data);
      } catch (error) {
        console.error('Error loading trending artists / Erro ao carregar artistas em tendência:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrendingArtists();
  }, []);

  /**
   * Handles search functionality
   * Lida com funcionalidade de pesquisa
   */
  const handleSearch = async (query) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await fetchArtists(query);
      setArtists(results);
    } catch (error) {
      console.error('Search error / Erro de pesquisa:', error);
      setArtists([]);
    } finally {
      setIsLoading(false);
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
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

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
            <div className={styles.loadingSpinner}>
              <p>Loading artists / Carregando artistas...</p>
            </div>
          )}

          {!isLoading && artists.length === 0 && (
            <div className={styles.noResults}>
              <p>
                {hasSearched
                  ? 'No artists found / Nenhum artista encontrado'
                  : 'Search for artists to get started / Pesquise artistas para começar'}
              </p>
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
        </section>
      </main>
    </div>
  );
};

export default Home;