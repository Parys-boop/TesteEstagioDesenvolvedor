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

import artistsData from '@/data/artists.json';

// Cache for Spotify access token to avoid repeated authentication
// Cache para token de acesso do Spotify para evitar autenticação repetida
let spotifyAccessToken = null;
let tokenExpiresAt = null;

/**
 * Reset Spotify token cache
 * Reseta o cache do token Spotify
 */
function resetSpotifyToken() {
  spotifyAccessToken = null;
  tokenExpiresAt = null;
}

/**
 * Get Spotify access token using Client Credentials Flow
 * Obtém token de acesso do Spotify usando Client Credentials Flow
 * 
 * @returns {Promise<string|null>} Access token or null if authentication fails / Token de acesso ou null se falhar
 */
async function getSpotifyAccessToken() {
  try {
    // Check if cached token is still valid
    // Verifica se token em cache ainda é válido
    if (spotifyAccessToken && tokenExpiresAt && tokenExpiresAt > Date.now()) {
      return spotifyAccessToken;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // If credentials are not configured, return null
    // Se credenciais não estão configuradas, retorna null
    if (!clientId || !clientSecret) {
      console.error('Spotify credentials not configured / Credenciais do Spotify não configuradas');
      return null;
    }

    console.log('Requesting new Spotify token / Requisitando novo token Spotify...');

    // Create authorization header
    // Cria header de autorização
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Request new access token
    // Requisita novo token de acesso
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Spotify auth failed with status ${response.status}: ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    // Cache the token with expiration time
    // Cacheia o token com tempo de expiração
    spotifyAccessToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry / Atualiza 1 minuto antes de expirar
    
    console.log('✓ Spotify token obtained successfully / Token do Spotify obtido com sucesso');
    return spotifyAccessToken;
  } catch (error) {
    console.error('Failed to get Spotify token / Falha ao obter token Spotify:', error.message);
    resetSpotifyToken();
    return null;
  }
}

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
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // If no query provided, return all local artists (trending/popular)
    // Se nenhuma query fornecida, retorna todos os artistas locais (em tendência/populares)
    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify(artistsData), {
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
          `https://api.spotify.com/v1/search?q=${encodedQuery}&type=artist&limit=50&offset=${offset}`,
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
            image: artist.images && artist.images[0] ? artist.images[0].url : 'https://via.placeholder.com/200x200?text=No+Image',
          }));

          console.log(`✓ Found ${artists.length} artists from Spotify / Encontrados ${artists.length} artistas do Spotify`);

          return new Response(JSON.stringify(artists), {
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

    // Fallback: Filter local artists by search query
    // Fallback: Filtra artistas locais pelo termo de busca
    console.log('Using local fallback / Usando fallback local');
    const lowerQuery = query.toLowerCase();
    const filteredArtists = artistsData.filter(
      (artist) =>
        artist.name.toLowerCase().includes(lowerQuery) ||
        artist.genre.toLowerCase().includes(lowerQuery)
    );

    return new Response(JSON.stringify(filteredArtists), {
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
