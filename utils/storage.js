/**
 * Storage utility functions for managing bookings in LocalStorage
 * Funções utilitárias de armazenamento para gerenciar contratações no LocalStorage
 */

const STORAGE_KEY = 'artistBookings';

/**
 * Retrieves all bookings from LocalStorage
 * Recupera todas as contratações do LocalStorage
 *
 * @returns {Array} Array of booking objects / Array de objetos de contratação
 */
export function getBookings() {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    // If parsing fails, return empty array
    // Se o parsing falhar, retorna array vazio
    console.error('Error reading bookings from LocalStorage:', error);
    return [];
  }
}

/**
 * Saves a new booking to LocalStorage
 * Salva uma nova contratação no LocalStorage
 *
 * @param {Object} booking - Booking data to save / Dados da contratação para salvar
 * @returns {Object} The saved booking with generated id / A contratação salva com id gerado
 */
export function saveBooking(booking) {
  const bookings = getBookings();

  // Generate a unique id for the booking
  // Gera um id único para a contratação
  const newBooking = {
    ...booking,
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));

  return newBooking;
}