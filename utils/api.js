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

/**
 * Fetches trending/popular artists from Spotify
 * Busca artistas em tendência/populares do Spotify
 *
 * Searches for popular genres and uses them to fetch trending artists
 * Pesquisa gêneros populares e os usa para buscar artistas em tendência
 *
 * @param {number} [limit=20] - Number of artists to fetch / Número de artistas a buscar
 * @returns {Promise<Array>} Array of trending artists / Array de artistas em tendência
 */
export async function fetchTrendingArtists(limit = 20) {
  try {
    // Popular search terms that typically return trending artists
    // Termos de busca populares que normalmente retornam artistas em tendência
    const trendingQueries = ['pop', 'hip-hop', 'rock', 'edm', 'indie'];
    
    // Pick a random query to vary the results / Escolhe uma query aleatória para variar os resultados
    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    
    const response = await axios.get('/api/searchArtists', {
      params: { q: randomQuery, offset: 0, limit },
    });

    return response.data.artists || [];
  } catch (error) {
    console.error('Trending artists API error / Erro ao buscar artistas em tendência:', error);
    return [];
  }
}