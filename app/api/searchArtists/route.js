// app/api/searchArtists/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// Configurações
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 10;

export async function GET(request) {
  // 1. Ler parâmetros da URL (Query, Offset, Limit)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // Parse offset - sempre um número inteiro válido
  let offset = parseInt(searchParams.get('offset'));
  offset = Number.isFinite(offset) ? offset : 0;
  offset = Math.max(0, offset);
  
  // Parse limit - sempre um número inteiro válido entre 1 e MAX_LIMIT
  let limit = parseInt(searchParams.get('limit'));
  if (!Number.isFinite(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  }
  limit = Math.min(limit, MAX_LIMIT);
  
  console.log('Query:', query, 'Offset:', offset, 'Limit:', limit, 'Type of limit:', typeof limit);

  // Se não tiver busca ou busca muito curta, retorna lista vazia no formato correto
  if (!query || query.length < 2) {
    return NextResponse.json({ artists: [], hasMore: false, nextOffset: 0 });
  }

  try {
    // 2. Autenticação Spotify (Tudo aqui dentro, sem depender de outro arquivo)
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do Spotify não configuradas no .env.local');
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    
    console.log('Access token obtained successfully'); // Debug log

    // 3. Buscar Artistas no Spotify (com paginação)
    // Nota: O Spotify usa 'offset' e 'limit' igual nosso app
    const spotifyUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}&offset=${offset}`;
    
    console.log('Spotify URL:', spotifyUrl); // Debug log
    console.log('Limit:', limit, 'Offset:', offset, 'Query:', query); // Debug log
    
    const searchResponse = await axios.get(spotifyUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    // 4. Formatar os dados
    console.log('Search response artists count:', searchResponse.data.artists.items.length);
    const spotifyItems = searchResponse.data.artists.items;
    const total = searchResponse.data.artists.total;
    
    console.log('Mapping artists...');
    const artists = spotifyItems.map((artist, idx) => {
      try {
        const mapped = {
          id: artist.id,
          name: artist.name,
          // Pega a imagem média (index 1) ou a primeira, ou placeholder
          image: artist.images?.[1]?.url || artist.images?.[0]?.url || 'https://via.placeholder.com/300?text=Sem+Imagem',
          genre: artist.genres?.[0] || 'Gênero não listado',a
        };
        return mapped;
      } catch (mapError) {
        console.error(`Error mapping artist ${idx}:`, mapError.message);
        throw mapError;
      }
    });

    // Calcular se tem mais páginas
    const nextOffset = offset + artists.length;
    const hasMore = nextOffset < total;

    // Retorna o Objeto completo que o utils/api.js espera
    return NextResponse.json({
      artists,
      hasMore,
      nextOffset,
      total
    });

  } catch (error) {
    console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error status:', error.response?.status);
    console.error('Error message:', error.message);
    console.error('Erro na API:', error.response?.data || error.message);
    // Em caso de erro, retorna vazio para não quebrar o front
    return NextResponse.json({ error: error.response?.data || error.message, artists: [], hasMore: false, nextOffset: 0 }, { status: 500 });
  }
}