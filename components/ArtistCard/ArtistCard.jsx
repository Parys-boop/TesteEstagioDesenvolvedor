import Image from 'next/image';
import styles from './ArtistCard.module.css';

/**
 * ArtistCard Component
 * Displays individual artist information in search results with image, name, and genre
 *
 * Componente ArtistCard
 * Exibe informações individuais do artista nos resultados de pesquisa com imagem, nome e gênero
 *
 * @param {Object} artist - Artist data object / Objeto de dados do artista
 * @param {string} artist.id - Unique artist identifier / Identificador único do artista
 * @param {string} artist.name - Artist name / Nome do artista
 * @param {string} artist.image - Artist image URL / URL da imagem do artista
 * @param {string} artist.genre - Artist genre / Gênero do artista
 * @param {Function} onSelect - Callback when artist card is clicked / Callback quando card do artista é clicado
 */
const ArtistCard = ({ artist, onSelect }) => {
  const genresText = Array.isArray(artist.genres) && artist.genres.length > 0
    ? artist.genres.join(', ')
    : artist.genre || 'Gênero não informado';

  /**
   * Handles keyboard interaction for accessibility
   * Lida com interação de teclado para acessibilidade
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(artist);
    }
  };

  return (
    <article
      className={styles.card}
      onClick={() => onSelect(artist)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Selecionar artista ${artist.name}`}
    >
      {artist.image && (
        <div className={styles.imageWrapper}>
          <Image
            src={artist.image}
            alt={`Foto de ${artist.name}`}
            className={styles.image}
            width={200}
            height={200}
            loading="lazy"
          />
        </div>
      )}
      <h3 className={styles.name}>{artist.name}</h3>
      <p className={styles.genre} aria-label="Gêneros musicais">
        {genresText}
      </p>
    </article>
  );
};

export default ArtistCard;
