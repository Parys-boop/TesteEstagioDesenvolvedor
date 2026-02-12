/**
 * API utility functions for fetching artist data
 * Funções utilitárias de API para buscar dados de artistas
 */
import axios from 'axios'; // Ensure axios is installed / Garanta que o axios está instalado

/**
 * Fetches artists based only on Spotify API results
 * Busca artistas apenas com base nos resultados da API do Spotify
 *
 * @param {Object} options - Search options / Opções de busca
 * @param {string} options.query - Search term / Termo de busca
 * @param {number} [options.offset=0] - Pagination offset / Deslocamento para paginação
 * @param {number} [options.limit=20] - Page size / Tamanho da página
 * @returns {Promise<{artists: Array, hasMore: boolean, nextOffset: number}>} Paginated artists / Artistas paginados
 */
export async function fetchArtists({ query, offset = 0, limit = 20 }) {
  // If there is no search term, return empty list (no local mock)
  // Se não houver termo de busca, retorna lista vazia (sem mock local)
  if (!query || query.trim().length === 0) {
    return { artists: [], hasMore: false, nextOffset: 0 };
  }

  try {
    // Call our secure Next.js API Route that talks to Spotify
    // Chama nossa rota de API do Next.js que conversa com o Spotify
    const response = await axios.get('/api/searchArtists', {
      params: { q: query, offset, limit },
    });

    // Return artists from API response directly
    // Retorna artistas diretamente da resposta da API
    return response.data;
  } catch (error) {
    console.error('Spotify API error, returning empty list / Erro na API do Spotify, retornando lista vazia:', error);

    // On any error we return an empty list (no hardcoded artists)
    // Em qualquer erro retornamos lista vazia (sem artistas hardcoded)
    return { artists: [], hasMore: false, nextOffset: offset };
  }
}