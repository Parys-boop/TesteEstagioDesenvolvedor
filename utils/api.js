/**
 * API utility functions for fetching artist data
 */
import axios from 'axios'; // Certifique-se que axios está instalado
import fallbackArtists from '../data/artists.json';

/**
 * Fetches artists based on search query
 * Uses Spotify API via Next.js API Route, with mock fallback
 */
export async function fetchArtists(query) {
  // 1. Se não tiver query, retorna os populares (Mock/Fallback)
  // O Spotify não tem um endpoint simples de "populares" sem contexto de usuário logado
  if (!query || query.trim().length === 0) {
    return fallbackArtists;
  }

  try {
    // 2. Tenta chamar nossa API Route segura
    // A rota que criamos no Passo 3
    const response = await axios.get(`/api/searchArtists`, {
      params: { q: query }
    });

    // Se a API retornar lista vazia, podemos decidir mostrar nada ou fallback
    return response.data;

  } catch (error) {
    console.error("Erro na API do Spotify, usando fallback:", error);
    
    // 3. Fallback: Se a API falhar, filtra no JSON local (seu código original)
    const lowerQuery = query.toLowerCase();
    return fallbackArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(lowerQuery) ||
        artist.genre.toLowerCase().includes(lowerQuery)
    );
  }
}