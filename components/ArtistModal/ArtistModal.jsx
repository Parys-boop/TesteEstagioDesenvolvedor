'use client';

import Image from 'next/image';
import styles from './ArtistModal.module.css';

const ArtistModal = ({ artist, isOpen, onClose, onHire }) => {
  if (!isOpen || !artist) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do artista ${artist.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar modal">
          ✕
        </button>
        <div className={styles.content}>
          {artist.image && (
            <Image
              src={artist.image}
              alt={`Foto de ${artist.name}`}
              width={120}
              height={120}
              className={styles.image}
            />
          )}
          <div>
            <h3 className={styles.name}>{artist.name}</h3>
            <p className={styles.genre}>Gênero: {artist.genre}</p>
          </div>
        </div>
        <button type="button" className={styles.hireButton} onClick={onHire}>
          Contratar
        </button>
      </div>
    </div>
  );
};

export default ArtistModal;
