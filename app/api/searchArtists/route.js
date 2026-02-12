/**
 * Search Artists API Route
 * Busca de Artistas - Rota da API
 * 
 * This API route handles artist search requests with Spotify API integration
 * Esta rota da API lida com requisições de busca de artistas com integração ao Spotify
 * 
 * Uses Client Credentials Flow for authentication
 * Usa Client Credentials Flow para autenticação
 * 
 * @route GET /api/searchArtists
 * @param {string} q - Search query / Termo de busca
 * @param {number} offset - Pagination offset / Deslocamento para paginação
 * @returns {Promise<Array>} Array of artists / Array de artistas
 */

import { getSpotifyAccessToken } from './spotifyClient';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * GET request handler for artist search
 * Manipulador de requisição GET para busca de artistas
 * 
 * Searches Spotify API for artists, with fallback to local data
 * Pesquisa API do Spotify por artistas, com fallback para dados locais
 */
export async function GET(request) {
  try {
    // Extract search query from URL parameters
    // Extrai o termo de busca dos parâmetros da URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);
    const limit = Number.isNaN(requestedLimit)
      ? DEFAULT_LIMIT
      : Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);

    // If no query provided, return empty list (no local mock data)
    // Se nenhuma query for fornecida, retorna lista vazia (sem dados mock locais)
    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({
        artists: [],
        hasMore: false,
        nextOffset: 0,
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600',
        },
      });
    }

    // Try to fetch from Spotify API
    // Tenta buscar da API do Spotify
    const accessToken = await getSpotifyAccessToken();
    
    if (accessToken) {
      try {
        // Search Spotify API for artists
        // Pesquisa API do Spotify por artistas
        const encodedQuery = encodeURIComponent(query);
        const spotifyResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodedQuery}&type=artist&limit=${limit}&offset=${offset}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Spotify response status:', spotifyResponse.status);
        
        if (spotifyResponse.ok) {
          const data = await spotifyResponse.json();
          
          // Transform Spotify response to our format
          // Transforma resposta do Spotify para nosso formato
          const artists = data.artists.items.map((artist) => ({
            id: artist.id,
            name: artist.name,
            genre: artist.genres && artist.genres.length > 0 ? artist.genres.join(', ') : 'Not classified / Não classificado',
            // Use image only when provided by Spotify API
            // Usa imagem apenas quando fornecida pela API do Spotify
            image: artist.images && artist.images[0] ? artist.images[0].url : null,
          }));

          console.log(`✓ Found ${artists.length} artists from Spotify / Encontrados ${artists.length} artistas do Spotify`);

          const total = data.artists.total ?? 0;
          const nextOffset = offset + artists.length;
          const hasMore = nextOffset < total;

          return new Response(JSON.stringify({
            artists,
            hasMore,
            nextOffset,
            total,
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, s-maxage=1800',
            },
          });
        } else {
          try {
            const errorData = await spotifyResponse.json();
            console.warn('Spotify API error response:', spotifyResponse.status, errorData);
          } catch (parseError) {
            const errorText = await spotifyResponse.text();
            console.warn('Spotify API error (non-JSON response):', spotifyResponse.status, errorText.substring(0, 200));
          }
        }
      } catch (spotifyError) {
        // If Spotify API call fails, log and fall through to local search
        // Se chamada da API do Spotify falhar, loga e usa busca local
        console.warn('Spotify search error / Erro na busca Spotify:', spotifyError.message);
      }
    } else {
      console.warn('No Spotify token available / Nenhum token Spotify disponível');
    }

    // Fallback: when Spotify is unavailable, return empty list instead of hardcoded artists
    // Fallback: quando o Spotify estiver indisponível, retorna lista vazia em vez de artistas hardcoded
    console.log('Using empty fallback (no local artists) / Usando fallback vazio (sem artistas locais)');

    return new Response(JSON.stringify({
      artists: [],
      hasMore: false,
      nextOffset: offset,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    // Handle any unexpected errors
    // Lida com qualquer erro inesperado
    console.error('API Route Error / Erro na Rota da API:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to search artists / Falha ao pesquisar artistas',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
