'use client';

import { useEffect, useState } from 'react';
import ArtistCard from '@/components/ArtistCard/ArtistCard';
import { fetchArtistasPorGenero } from '@/utils/api';
import styles from './SectionPorGenero.module.css';

const GENRES = ['Rock', 'Pop', 'Sertanejo', 'Funk', 'MPB', 'Eletrônica'];
const DEFAULT_LIMIT = 6;

const SectionPorGenero = ({ onSelect }) => {
  const [sections, setSections] = useState(
    GENRES.map((genre) => ({
      genre,
      artists: [],
      isLoading: true,
      errorMessage: '',
    }))
  );

  useEffect(() => {
    let active = true;

    GENRES.forEach(async (genre) => {
      const response = await fetchArtistasPorGenero(genre, DEFAULT_LIMIT);
      if (!active) return;

      setSections((prev) =>
        prev.map((section) => {
          if (section.genre !== genre) return section;

          if (response.error === 'rate_limit') {
            return {
              ...section,
              artists: [],
              isLoading: false,
              errorMessage: 'Limite da Spotify atingido. Tente novamente em instantes.',
            };
          }

          if (response.error) {
            return {
              ...section,
              artists: [],
              isLoading: false,
              errorMessage: 'Não foi possível carregar artistas deste gênero.',
            };
          }

          return {
            ...section,
            artists: response.artists || [],
            isLoading: false,
            errorMessage: '',
          };
        })
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className={styles.section} aria-label="Artistas por gênero">
      {sections.map((section) => (
        <div key={section.genre} className={styles.genreBlock}>
          <h3 className={styles.genreTitle}>{section.genre}</h3>

          {section.isLoading && (
            <div className={styles.skeletonGrid} aria-hidden="true">
              {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
                <div key={index} className={styles.skeletonCard} />
              ))}
            </div>
          )}

          {!section.isLoading && section.errorMessage && (
            <p className={styles.error}>{section.errorMessage}</p>
          )}

          {!section.isLoading && !section.errorMessage && (
            <div className={styles.grid}>
              {section.artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default SectionPorGenero;
