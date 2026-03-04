import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromResponse(response) {
    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [];

    for (const rawCookie of setCookies) {
      const [cookiePair] = rawCookie.split(';');
      const separatorIndex = cookiePair.indexOf('=');
      if (separatorIndex <= 0) {
        continue;
      }

      const name = cookiePair.slice(0, separatorIndex).trim();
      const value = cookiePair.slice(separatorIndex + 1).trim();

      if (!value) {
        this.cookies.delete(name);
        continue;
      }

      this.cookies.set(name, value);
    }
  }

  toHeader() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
}

const asJsonSafe = async (response) => {
  const rawText = await response.text();
  try {
    return rawText ? JSON.parse(rawText) : null;
  } catch {
    return null;
  }
};

const request = async (path, { method = 'GET', headers = {}, body, jar } = {}) => {
  const requestHeaders = new Headers(headers);
  const cookieHeader = jar?.toHeader();
  if (cookieHeader) {
    requestHeaders.set('Cookie', cookieHeader);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body,
    redirect: 'manual',
    signal: AbortSignal.timeout(20000),
  });

  jar?.setFromResponse(response);
  const json = await asJsonSafe(response);

  return { status: response.status, json };
};

const datePlusDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const main = async () => {
  const anonList = await request('/api/eventos');
  assert.equal(anonList.status, 401, 'Usuario nao autenticado deve receber 401 ao listar eventos');

  const anonCreate = await request('/api/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Evento sem login',
      data: datePlusDays(7),
      local: 'Teste',
      artistaIds: ['111'],
      artistas: [{ id: '111', name: 'Artista Teste', image: null, genre: 'pop' }],
    }),
  });
  assert.equal(anonCreate.status, 401, 'Usuario nao autenticado deve receber 401 ao criar evento');

  const anonUpdate = await request('/api/eventos/507f1f77bcf86cd799439011', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Atualizacao sem login',
      data: datePlusDays(8),
      local: 'Teste',
    }),
  });
  assert.equal(anonUpdate.status, 401, 'Usuario nao autenticado deve receber 401 ao atualizar evento');

  const anonDelete = await request('/api/eventos/507f1f77bcf86cd799439011', {
    method: 'DELETE',
  });
  assert.equal(anonDelete.status, 401, 'Usuario nao autenticado deve receber 401 ao excluir evento');

  const authJar = new CookieJar();
  const email = `crud.eventos.${Date.now()}@example.com`;
  const senha = '123456';

  const register = await request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome: 'Teste CRUD Eventos', email, senha }),
    jar: authJar,
  });
  assert.equal(register.status, 201, 'Cadastro do usuario deve retornar 201');

  const csrf = await request('/api/auth/csrf', { jar: authJar });
  assert.equal(csrf.status, 200, 'CSRF deve retornar 200');
  assert.ok(csrf.json?.csrfToken, 'CSRF token nao foi retornado');

  const loginForm = new URLSearchParams({
    csrfToken: csrf.json.csrfToken,
    email,
    senha,
    callbackUrl: `${BASE_URL}/`,
    json: 'true',
  });

  const login = await request('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: loginForm.toString(),
    jar: authJar,
  });
  assert.equal(login.status, 200, 'Login deve retornar 200');

  const session = await request('/api/auth/session', { jar: authJar });
  assert.equal(session.status, 200, 'Sessao autenticada deve retornar 200');
  assert.ok(session.json?.user?.id, 'Sessao autenticada nao possui user.id');

  const initialList = await request('/api/eventos', { jar: authJar });
  assert.equal(initialList.status, 200, 'Listagem autenticada deve retornar 200');
  const initialCount = Array.isArray(initialList.json?.eventos)
    ? initialList.json.eventos.length
    : 0;

  const create = await request('/api/eventos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Evento de Teste CRUD',
      data: datePlusDays(10),
      local: 'Sao Paulo',
      artistaIds: ['111'],
      artistas: [{ id: '111', name: 'Artista Teste', image: null, genre: 'pop' }],
    }),
    jar: authJar,
  });
  assert.equal(create.status, 201, 'Criacao de evento deve retornar 201');
  assert.ok(create.json?.evento?.id, 'Evento criado nao possui id');
  const eventId = create.json.evento.id;

  const afterCreate = await request('/api/eventos', { jar: authJar });
  assert.equal(afterCreate.status, 200, 'Listagem apos criacao deve retornar 200');
  const createdEvent = Array.isArray(afterCreate.json?.eventos)
    ? afterCreate.json.eventos.find((evento) => evento.id === eventId)
    : null;
  assert.ok(createdEvent, 'Evento criado nao apareceu na listagem');

  const update = await request(`/api/eventos/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Evento de Teste CRUD Atualizado',
      data: datePlusDays(11),
      local: 'Campinas',
    }),
    jar: authJar,
  });
  assert.equal(update.status, 200, 'Atualizacao de evento deve retornar 200');

  const afterUpdate = await request('/api/eventos', { jar: authJar });
  const updatedEvent = Array.isArray(afterUpdate.json?.eventos)
    ? afterUpdate.json.eventos.find((evento) => evento.id === eventId)
    : null;
  assert.equal(updatedEvent?.titulo, 'Evento de Teste CRUD Atualizado', 'Titulo nao foi atualizado');

  const remove = await request(`/api/eventos/${eventId}`, {
    method: 'DELETE',
    jar: authJar,
  });
  assert.equal(remove.status, 200, 'Exclusao de evento deve retornar 200');

  const afterDelete = await request('/api/eventos', { jar: authJar });
  const finalList = Array.isArray(afterDelete.json?.eventos) ? afterDelete.json.eventos : [];
  assert.equal(
    finalList.some((evento) => evento.id === eventId),
    false,
    'Evento removido ainda aparece na listagem'
  );
  assert.equal(
    finalList.length,
    initialCount,
    'Quantidade final de eventos deveria retornar ao estado inicial'
  );

  console.log('Teste CRUD de eventos concluido com sucesso.');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Usuario de teste: ${email}`);
};

main().catch((error) => {
  console.error('Falha no teste CRUD de eventos:', error.message);
  process.exitCode = 1;
});
