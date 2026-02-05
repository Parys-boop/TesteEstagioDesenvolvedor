/**
 * Form validation utility functions
 * Funções utilitárias de validação de formulário
 */

/**
 * Validates the booking form fields
 * Valida os campos do formulário de contratação
 *
 * @param {Object} data - Form data to validate / Dados do formulário para validar
 * @returns {Object} Object with isValid flag and errors / Objeto com flag isValid e erros
 */
export function validateBookingForm(data) {
  const errors = {};

  // Validate client name - required and minimum 3 characters
  // Valida nome do cliente - obrigatório e mínimo 3 caracteres
  if (!data.clientName || data.clientName.trim().length < 3) {
    errors.clientName = 'Name is required and must have at least 3 characters / Nome é obrigatório e deve ter pelo menos 3 caracteres';
  }

  // Validate selected artist - required
  // Valida artista selecionado - obrigatório
  if (!data.selectedArtist || !data.selectedArtist.name) {
    errors.selectedArtist = 'Please select an artist / Por favor selecione um artista';
  }

  // Validate event date - required and must be a future date
  // Valida data do evento - obrigatória e deve ser uma data futura
  if (!data.eventDate) {
    errors.eventDate = 'Event date is required / Data do evento é obrigatória';
  } else {
    const selectedDate = new Date(data.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      errors.eventDate = 'Event date must be in the future / Data do evento deve ser futura';
    }
  }

  // Validate fee - optional but must be positive if provided
  // Valida cachê - opcional mas deve ser positivo se informado
  if (data.fee !== undefined && data.fee !== '' && Number(data.fee) < 0) {
    errors.fee = 'Fee must be a positive value / Cachê deve ser um valor positivo';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}