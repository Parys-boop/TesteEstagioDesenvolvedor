import styles from './BookingSuccess.module.css';

/**
 * BookingSuccess Component
 * Displays a success message after a booking is submitted
 *
 * Componente BookingSuccess
 * Exibe uma mensagem de sucesso após uma contratação ser enviada
 *
 * @param {Object} booking - The submitted booking data / Os dados da contratação enviada
 * @param {Function} onNewBooking - Callback to start a new booking / Callback para iniciar nova contratação
 * @param {Function} onViewHistory - Callback to view booking history / Callback para ver histórico
 */
const BookingSuccess = ({ booking, onNewBooking, onViewHistory }) => {
  return (
    <section className={styles.container} aria-label="Confirmação da contratação">
      {/* Success icon animation / Animação do ícone de sucesso */}
      <div className={styles.iconWrapper}>
        <span className={styles.checkIcon}>✓</span>
      </div>

      <h2 className={styles.title}>Contratação confirmada!</h2>
      <p className={styles.subtitle}>Seu pedido foi confirmado.</p>

      {/* Booking summary / Resumo da contratação */}
      <div className={styles.summary}>
        <p><strong>Artista:</strong> {booking.selectedArtist.name}</p>
        <p><strong>Cliente:</strong> {booking.clientName}</p>
        <p><strong>Data:</strong> {new Date(booking.eventDate).toLocaleDateString('pt-BR')}</p>
        {booking.fee && <p><strong>Cachê:</strong> R$ {Number(booking.fee).toLocaleString('pt-BR')}</p>}
        {booking.address && <p><strong>Endereço:</strong> {booking.address}</p>}
      </div>

      {/* Action buttons / Botões de ação */}
      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onNewBooking}>
          Nova contratação
        </button>
        <button className={styles.secondaryBtn} onClick={onViewHistory}>
          Ver histórico
        </button>
      </div>
    </section>
  );
};

export default BookingSuccess;
