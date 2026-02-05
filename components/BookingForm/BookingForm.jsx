import { useState } from 'react';
import Image from 'next/image';
import { validateBookingForm } from '../../utils/validation';
import styles from './BookingForm.module.css';

/**
 * BookingForm Component
 * Collects booking information for the selected artist including client name,
 * event date, fee, and address
 *
 * Componente BookingForm
 * Coleta informações de contratação para o artista selecionado incluindo nome do cliente,
 * data do evento, cachê e endereço
 *
 * @param {Object} selectedArtist - The artist selected by the user / O artista selecionado pelo usuário
 * @param {Function} onSubmit - Callback when form is submitted successfully / Callback quando formulário é enviado com sucesso
 * @param {Function} onCancel - Callback to go back to search / Callback para voltar à pesquisa
 */
const BookingForm = ({ selectedArtist, onSubmit, onCancel }) => {
  // Form state for all fields / Estado do formulário para todos os campos
  const [formData, setFormData] = useState({
    clientName: '',
    fee: '',
    eventDate: '',
    address: '',
  });

  // Validation errors state / Estado de erros de validação
  const [errors, setErrors] = useState({});

  /**
   * Handles changes in form input fields
   * Lida com mudanças nos campos do formulário
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for the field being edited / Limpa erro do campo sendo editado
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /**
   * Handles form submission with validation
   * Lida com submissão do formulário com validação
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Build complete booking object / Constrói objeto completo de contratação
    const bookingData = {
      ...formData,
      selectedArtist,
    };

    // Validate form data / Valida dados do formulário
    const validation = validateBookingForm(bookingData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // If valid, call onSubmit callback / Se válido, chama callback onSubmit
    onSubmit(bookingData);
  };

  /**
   * Gets the minimum date for the date picker (tomorrow)
   * Obtém a data mínima para o seletor de data (amanhã)
   */
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <header className={styles.header}>
        <button type="button" className={styles.backBtn} onClick={onCancel}>
          ← Back / Voltar
        </button>
        <h2 className={styles.title}>
          Book {selectedArtist.name} / Contratar {selectedArtist.name}
        </h2>
      </header>

      {/* Artist preview card / Card de preview do artista */}
      <div className={styles.artistPreview}>
        <Image
          src={selectedArtist.image || 'https://via.placeholder.com/60x60?text=No+Image'}
          alt={selectedArtist.name}
          className={styles.artistImage}
          width={60}
          height={60}
        />
        <div>
          <strong>{selectedArtist.name}</strong>
          <p className={styles.genreLabel}>{selectedArtist.genre}</p>
        </div>
      </div>

      {/* Client name field (required) / Campo nome do cliente (obrigatório) */}
      <div className={styles.field}>
        <label htmlFor="clientName" className={styles.label}>
          Name / Nome <span className={styles.required}>*</span>
        </label>
        <input
          id="clientName"
          name="clientName"
          type="text"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="Your full name / Seu nome completo"
          className={`${styles.input} ${errors.clientName ? styles.inputError : ''}`}
          aria-required="true"
          aria-invalid={!!errors.clientName}
        />
        {errors.clientName && (
          <span className={styles.errorMsg} role="alert">{errors.clientName}</span>
        )}
      </div>

      {/* Selected artist field (read-only, required) / Campo artista selecionado (somente leitura, obrigatório) */}
      <div className={styles.field}>
        <label htmlFor="selectedArtist" className={styles.label}>
          Selected Artist / Artista Selecionado <span className={styles.required}>*</span>
        </label>
        <input
          id="selectedArtist"
          type="text"
          value={selectedArtist.name}
          readOnly
          className={`${styles.input} ${styles.readOnly}`}
          aria-required="true"
        />
      </div>

      {/* Fee field (optional) / Campo cachê (opcional) */}
      <div className={styles.field}>
        <label htmlFor="fee" className={styles.label}>
          Fee / Cachê (R$)
        </label>
        <input
          id="fee"
          name="fee"
          type="number"
          min="0"
          step="0.01"
          value={formData.fee}
          onChange={handleChange}
          placeholder="Optional / Opcional"
          className={`${styles.input} ${errors.fee ? styles.inputError : ''}`}
          aria-invalid={!!errors.fee}
        />
        {errors.fee && (
          <span className={styles.errorMsg} role="alert">{errors.fee}</span>
        )}
      </div>

      {/* Event date field (required) / Campo data do evento (obrigatório) */}
      <div className={styles.field}>
        <label htmlFor="eventDate" className={styles.label}>
          Event Date / Data do Evento <span className={styles.required}>*</span>
        </label>
        <input
          id="eventDate"
          name="eventDate"
          type="date"
          min={getMinDate()}
          value={formData.eventDate}
          onChange={handleChange}
          className={`${styles.input} ${errors.eventDate ? styles.inputError : ''}`}
          aria-required="true"
          aria-invalid={!!errors.eventDate}
        />
        {errors.eventDate && (
          <span className={styles.errorMsg} role="alert">{errors.eventDate}</span>
        )}
      </div>

      {/* Address field (optional) / Campo endereço (opcional) */}
      <div className={styles.field}>
        <label htmlFor="address" className={styles.label}>
          Address / Endereço
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Event address (optional) / Endereço do evento (opcional)"
          className={styles.textarea}
          rows={3}
        />
      </div>

      {/* Submit button / Botão de envio */}
      <button type="submit" className={styles.submitBtn}>
        Submit Booking / Enviar Contratação
      </button>
    </form>
  );
};

export default BookingForm;