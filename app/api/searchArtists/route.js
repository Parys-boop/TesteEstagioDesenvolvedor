// app/api/searchArtists/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// Configurações
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export async function GET(request) {
  // 1. Ler parâmetros da URL (Query, Offset, Limit)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const offset = parseInt(searchParams.get('offset') || '0');
  let limit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT);
  
  // Garante que limit seja válido (entre 1 e MAX_LIMIT)
  limit = Math.max(1, Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT));

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
    // Teste hardcoded primeiro
    console.log('Testing with hardcoded query...');
    const testUrl = 'https://api.spotify.com/v1/search?q=queen&type=artist&limit=10&offset=0';
    try {
      const testResponse = await axios.get(testUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      console.log('Test request successful');
    } catch (testError) {
      console.log('Test request failed:', testError.response?.data);
    }
    
    // Nota: O Spotify usa 'offset' e 'limit' igual nosso app
    const searchParams = new URLSearchParams({
      q: query || 'a', // Fallback para 'a' se query estiver vazia
      type: 'artist',
      limit: limit.toString(),
      offset: offset.toString()
    });
    const spotifyUrl = `https://api.spotify.com/v1/search?${searchParams.toString()}`;
    
    console.log('Spotify URL:', spotifyUrl); // Debug log
    console.log('Limit value:', limit, 'Type:', typeof limit); // Debug log
    console.log('Query:', query); // Debug log
    
    const searchResponse = await axios.get(spotifyUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    // 4. Formatar os dados
    const spotifyItems = searchResponse.data.artists.items;
    const total = searchResponse.data.artists.total;

    const artists = spotifyItems.map((artist) => ({
      id: artist.id,
      name: artist.name,
      // Pega a imagem média (index 1) ou a primeira, ou placeholder
      image: artist.images[1]?.url || artist.images[0]?.url || 'https://via.placeholder.com/300?text=Sem+Imagem',
      genre: artist.genres[0] || 'Gênero não listado',
    }));

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
    console.error('Erro na API:', error.response?.data || error.message);
    // Em caso de erro, retorna vazio para não quebrar o front
    return NextResponse.json({ error: error.response?.data || error.message, artists: [], hasMore: false, nextOffset: 0 }, { status: 500 });
  }
}