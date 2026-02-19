import styles from './SearchBar.module.css';

/**
 * SearchBar Component
 * Renders a search input field for finding artists by name or genre
 *
 * Componente SearchBar
 * Renderiza um campo de input de pesquisa para encontrar artistas por nome ou gênero
 *
 * @param {string} value - Current search query / Valor atual da pesquisa
 * @param {Function} onSearch - Callback triggered when user types / Callback disparado quando usuário digita
 * @param {boolean} isLoading - Whether a search is in progress / Se uma pesquisa está em andamento
 */
const SearchBar = ({ value = '', onSearch, isLoading }) => {
  /**
   * Handles input change and triggers search callback
   * Lida com mudança no input e dispara callback de pesquisa
   */
  const handleInputChange = (e) => {
    onSearch(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor="artist-search" className={styles.label}>
        Pesquisar artistas
      </label>
      <div className={styles.inputContainer}>
        <span className={styles.searchIcon} aria-hidden="true">?</span>
        <input
          id="artist-search"
          type="text"
          placeholder="Pesquise artistas ou gêneros..."
          value={value}
          onChange={handleInputChange}
          className={styles.input}
          aria-label="Pesquisar artistas"
          autoComplete="off"
        />
        {/* Loading spinner shown during search / Spinner de carregamento durante pesquisa */}
        {isLoading && <span className={styles.spinner} aria-label="Carregando"></span>}
      </div>
    </div>
  );
};

export default SearchBar;
