const TOKEN_BUFFER_MS = 60_000;

/**
 * In-memory cache for Spotify token
 * Cache em memória para token do Spotify
 */
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Clears cached Spotify token
 * Limpa o token do Spotify em cache
 */
export function resetSpotifyToken() {
  cachedToken = null;
  tokenExpiresAt = 0;
}

/**
 * Obtains a Spotify access token using Client Credentials flow
 * Obtém um token de acesso do Spotify usando o fluxo Client Credentials
 *
 * @returns {Promise<string|null>} Access token or null if not available / Token de acesso ou null se não disponível
 */
export async function getSpotifyAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - TOKEN_BUFFER_MS) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Spotify credentials missing / Credenciais do Spotify ausentes');
    return null;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to obtain Spotify token / Falha ao obter token do Spotify:', response.status, errorText);
      resetSpotifyToken();
      return null;
    }

    const tokenPayload = await response.json();
    cachedToken = tokenPayload.access_token;
    tokenExpiresAt = now + tokenPayload.expires_in * 1000;
    return cachedToken;
  } catch (error) {
    console.error('Token request error / Erro na requisição de token:', error.message);
    resetSpotifyToken();
    return null;
  }
}
