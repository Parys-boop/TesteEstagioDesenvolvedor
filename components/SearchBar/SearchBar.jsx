import { useState } from 'react';
import styles from './SearchBar.module.css';

/**
 * SearchBar Component
 * Renders a search input field for finding artists by name or genre
 *
 * Componente SearchBar
 * Renderiza um campo de input de pesquisa para encontrar artistas por nome ou gênero
 *
 * @param {Function} onSearch - Callback triggered when user types / Callback disparado quando usuário digita
 * @param {boolean} isLoading - Whether a search is in progress / Se uma pesquisa está em andamento
 */
const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  /**
   * Handles input change and triggers search callback
   * Lida com mudança no input e dispara callback de pesquisa
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor="artist-search" className={styles.label}>
        Search Artists / Pesquisar Artistas
      </label>
      <div className={styles.inputContainer}>
        <span className={styles.searchIcon} aria-hidden="true">🔍</span>
        <input
          id="artist-search"
          type="text"
          placeholder="Search for artists or genres... / Pesquise artistas ou gêneros..."
          value={query}
          onChange={handleInputChange}
          className={styles.input}
          aria-label="Search for artists"
          autoComplete="off"
        />
        {/* Loading spinner shown during search / Spinner de carregamento durante pesquisa */}
        {isLoading && <span className={styles.spinner} aria-label="Loading"></span>}
      </div>
    </div>
  );
};

export default SearchBar;