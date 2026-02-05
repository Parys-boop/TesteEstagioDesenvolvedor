import Image from 'next/image';
import styles from './BookingHistory.module.css';

/**
 * BookingHistory Component
 * Displays a list of all previous bookings stored in LocalStorage
 *
 * Componente BookingHistory
 * Exibe uma lista de todas as contratações anteriores armazenadas no LocalStorage
 *
 * @param {Array} bookings - Array of booking objects / Array de objetos de contratação
 * @param {Function} onBack - Callback to return to search / Callback para retornar à pesquisa
 */
const BookingHistory = ({ bookings, onBack }) => {
  return (
    <section className={styles.container} aria-label="Booking history">
      <header className={styles.header}>
        <h2>Booking History / Histórico de Contratações</h2>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Search / Voltar à Pesquisa
        </button>
      </header>

      {/* Check if there are any bookings / Verifica se há contratações */}
      {bookings.length === 0 ? (
        <div className={styles.empty}>
          <p>No bookings found. / Nenhuma contratação encontrada.</p>
          <button className={styles.backBtn} onClick={onBack}>
            Make your first booking! / Faça sua primeira contratação!
          </button>
        </div>
      ) : (
        <ul className={styles.list}>
          {bookings.map((booking, index) => (
            <li key={booking.id || index} className={styles.item}>
              {/* Artist image and info / Imagem e informações do artista */}
              <div className={styles.artistInfo}>
                {booking.selectedArtist.image && (
                  <Image
                    src={booking.selectedArtist.image}
                    alt={booking.selectedArtist.name}
                    className={styles.avatar}
                    width={48}
                    height={48}
                  />
                )}
                <div>
                  <h3 className={styles.artistName}>{booking.selectedArtist.name}</h3>
                  <span className={styles.genre}>{booking.selectedArtist.genre}</span>
                </div>
              </div>

              {/* Booking details / Detalhes da contratação */}
              <div className={styles.details}>
                <p><strong>Client / Cliente:</strong> {booking.clientName}</p>
                <p><strong>Date / Data:</strong> {new Date(booking.eventDate).toLocaleDateString('pt-BR')}</p>
                {booking.fee && (
                  <p><strong>Fee / Cachê:</strong> R$ {Number(booking.fee).toLocaleString('pt-BR')}</p>
                )}
                {booking.address && (
                  <p><strong>Address / Endereço:</strong> {booking.address}</p>
                )}
              </div>

              {/* Created timestamp / Data de criação */}
              <p className={styles.timestamp}>
                Booked on / Contratado em: {new Date(booking.createdAt).toLocaleString('pt-BR')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default BookingHistory;