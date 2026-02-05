/**
 * API utility functions for fetching artist data
 * Funções utilitárias de API para buscar dados de artistas
 */

import fallbackArtists from '../data/artists.json';

/**
 * Fetches artists based on search query
 * Uses mock data as fallback when no API key is configured
 *
 * Busca artistas com base na query de pesquisa
 * Usa dados mockados como fallback quando nenhuma chave de API está configurada
 *
 * @param {string} query - Search term / Termo de busca
 * @returns {Promise<Array>} Array of artist objects / Array de objetos de artistas
 */
export async function fetchArtists(query) {
  // If no query is provided, return trending/popular artists (fallback data)
  // Se nenhuma query for fornecida, retorna artistas em tendência (dados fallback)
  if (!query || query.trim().length === 0) {
    return fallbackArtists;
  }

  // Filter mock artists based on query (case-insensitive)
  // Filtra artistas mockados baseado na query (case-insensitive)
  const lowerQuery = query.toLowerCase();
  const filtered = fallbackArtists.filter(
    (artist) =>
      artist.name.toLowerCase().includes(lowerQuery) ||
      artist.genre.toLowerCase().includes(lowerQuery)
  );

  // Simulate network delay for realistic UX
  // Simula atraso de rede para UX realista
  return new Promise((resolve) => {
    setTimeout(() => resolve(filtered), 400);
  });
}