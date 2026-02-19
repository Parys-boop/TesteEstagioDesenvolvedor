'use client';

import { useEffect, useState } from 'react';
import ArtistCard from '@/components/ArtistCard/ArtistCard';
import { fetchArtistasPopulares } from '@/utils/api';
import styles from './SectionPopulares.module.css';

const DEFAULT_LIMIT = 8;

const SectionPopulares = ({ onSelect }) => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadPopular = async () => {
      setIsLoading(true);
      setErrorMessage('');
      const response = await fetchArtistasPopulares(DEFAULT_LIMIT);
      if (!active) return;

      if (response.error === 'rate_limit') {
        setErrorMessage('Limite da Spotify atingido. Tente novamente em instantes.');
        setArtists([]);
      } else if (response.error) {
        setErrorMessage('Não foi possível carregar artistas populares.');
        setArtists([]);
      } else {
        setArtists(response.artists || []);
      }
      setIsLoading(false);
    };

    loadPopular();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section} aria-label="Artistas populares">
      <header className={styles.header}>
        <h2>Artistas populares</h2>
      </header>

      {isLoading && (
        <div className={styles.skeletonGrid} aria-hidden="true">
          {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
            <div key={index} className={styles.skeletonCard} />
          ))}
        </div>
      )}

      {!isLoading && errorMessage && (
        <p className={styles.error}>{errorMessage}</p>
      )}

      {!isLoading && !errorMessage && (
        <div className={styles.grid}>
          {artists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} onSelect={onSelect} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SectionPopulares;
