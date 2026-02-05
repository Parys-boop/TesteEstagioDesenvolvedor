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
    <section className={styles.container} aria-label="Booking confirmation">
      {/* Success icon animation / Animação do ícone de sucesso */}
      <div className={styles.iconWrapper}>
        <span className={styles.checkIcon}>✓</span>
      </div>

      <h2 className={styles.title}>Booking Confirmed!</h2>
      <p className={styles.subtitle}>Contratação Confirmada!</p>

      {/* Booking summary / Resumo da contratação */}
      <div className={styles.summary}>
        <p><strong>Artist / Artista:</strong> {booking.selectedArtist.name}</p>
        <p><strong>Client / Cliente:</strong> {booking.clientName}</p>
        <p><strong>Date / Data:</strong> {new Date(booking.eventDate).toLocaleDateString('pt-BR')}</p>
        {booking.fee && <p><strong>Fee / Cachê:</strong> R$ {Number(booking.fee).toLocaleString('pt-BR')}</p>}
        {booking.address && <p><strong>Address / Endereço:</strong> {booking.address}</p>}
      </div>

      {/* Action buttons / Botões de ação */}
      <div className={styles.actions}>
        <button className={styles.primaryBtn} onClick={onNewBooking}>
          New Booking / Nova Contratação
        </button>
        <button className={styles.secondaryBtn} onClick={onViewHistory}>
          View History / Ver Histórico
        </button>
      </div>
    </section>
  );
};

export default BookingSuccess;