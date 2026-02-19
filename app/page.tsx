'use client';

import { useEffect, useState } from 'react';
import SearchHeader from '@/components/SearchHeader/SearchHeader';
import SectionPopulares from '@/components/SectionPopulares/SectionPopulares';
import SectionPorGenero from '@/components/SectionPorGenero/SectionPorGenero';
import CTACreateEvent from '@/components/CTACreateEvent/CTACreateEvent';
import ArtistModal from '@/components/ArtistModal/ArtistModal';
import ArtistCard from '@/components/ArtistCard/ArtistCard';
import { fetchArtists } from '@/utils/api';
import styles from './page.module.css';

const SEARCH_LIMIT = 6;
const DEBOUNCE_MS = 350;

export default function Page() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setDebouncedQuery('');
      return;
    }
    const timeout = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let active = true;

    const loadSearch = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSearchResults([]);
        setSearchError('');
        return;
      }

      setIsSearching(true);
      setSearchError('');
      const response = await fetchArtists({
        query: debouncedQuery.trim(),
        offset: 0,
        limit: SEARCH_LIMIT,
      });

      if (!active) return;

      if (response.error === 'rate_limit') {
        setSearchError('Limite da Spotify atingido. Tente novamente em instantes.');
        setSearchResults([]);
      } else {
        setSearchResults(response.artists || []);
      }
      setIsSearching(false);
    };

    loadSearch();

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleHireArtist = () => {
    setIsModalOpen(false);
    document.getElementById('cta-create-event')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>
      <SearchHeader value={query} onSearch={setQuery} isLoading={isSearching} />

      <main className={styles.content}>
        <div className={styles.sections}>
          {debouncedQuery.trim().length >= 2 && (
            <section aria-label="Resultados da busca" className={styles.searchSection}>
              <header>
                <h2 className={styles.searchTitle}>Resultados da busca</h2>
              </header>
              {isSearching && (
                <p className={styles.searchMessage}>Carregando resultados...</p>
              )}
              {!isSearching && searchError && (
                <p className={styles.searchMessage}>{searchError}</p>
              )}
              {!isSearching && !searchError && (
                <div>
                  {searchResults.length === 0 ? (
                    <p className={styles.searchMessage}>Nenhum artista encontrado.</p>
                  ) : (
                    <div className={styles.searchGrid}>
                      {searchResults.map((artist) => (
                        <ArtistCard key={artist.id} artist={artist} onSelect={handleSelectArtist} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          <SectionPopulares onSelect={handleSelectArtist} />
          <SectionPorGenero onSelect={handleSelectArtist} />
          <CTACreateEvent />
        </div>
      </main>

      <ArtistModal
        artist={selectedArtist}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onHire={handleHireArtist}
      />
    </div>
  );
}
