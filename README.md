README.md - Plataforma de Contratação de Artistas
📋 Diretrizes de Desenvolvimento para IA
Este documento serve como guia de referência obrigatório para qualquer assistente de IA trabalhando neste projeto. Todas as modificações devem aderir estritamente aos parâmetros e especificações descritos abaixo.

🎯 Visão Geral do Projeto
Cliente: ES
Tipo de Projeto: Aplicação Web para Contratação de Artistas para Eventos Particulares
Propósito: Permitir que usuários pesquisem artistas (bandas e cantores) e enviem solicitações de contratação para shows particulares.

🏗️ Requisitos de Arquitetura Central
Stack Tecnológico (OBRIGATÓRIO)
Frontend

Framework: Next.js OU React (Vite) - NÃO alterar sem autorização explícita
Estilização: CSS com animações/transições encorajadas
Gerenciamento de Estado: Livre escolha (Context API, Redux, Zustand, etc.)
Armazenamento: LocalStorage (requisito mínimo)

Backend (Opcional mas valorizado)

Framework: Laravel (se implementar backend)
Banco de Dados: Qualquer SQL/NoSQL (pontos extras se implementado)

Integração de API

Opções Primárias: API do Spotify ou API do YouTube
Fallback: Dados de artistas mockados/hardcoded se API indisponível
Regra: Deve buscar dados de fonte externa quando possível


📐 Fluxo da Aplicação (ESTRITO)
1. Página de Pesquisa (Tela Inicial)

┌─────────────────────────────────────┐
│  [Campo de Pesquisa de Artistas]   │
│                                     │
│  Estado Padrão (sem pesquisa):      │
│  - Mostrar artistas em tendência    │
│  - Mostrar resultados "populares"   │
└─────────────────────────────────────┘

Requisitos:

✅ Campo de pesquisa proeminente
✅ Exibir resultados em layout de grade OU lista
✅ Visualização padrão mostra artistas em tendência/populares (FUNCIONALIDADE BÔNUS)
✅ Lazy loading ou paginação para resultados da API (FUNCIONALIDADE BÔNUS)


2. Seleção de Artista e Formulário de Contratação
Gatilho: Usuário clica em um artista dos resultados de pesquisa
Campos do Formulário (OBRIGATÓRIO):
Nome do CampoTipoObrigatórioValidaçãoNomeTexto✅ SIM*Não vazioArtista SelecionadoTexto/Select✅ SIM*Pré-preenchido da seleçãoCachêNúmero/Moeda❌ NÃONúmero positivoData do EventoData✅ SIM*Data futuraEndereçoTexto❌ NÃO-
*Campos obrigatórios devem ter indicadores visuais (asterisco, cor, etc.)

3. Fluxo de Submissão do Formulário

Enviar Formulário → Validar Campos Obrigatórios → Salvar no Armazenamento → Tela de Sucesso → Opção de:
                                                                                                ├─ Fazer Nova Contratação
                                                                                                └─ Ver Contratações Anteriores

                                                                                                Regras de Armazenamento:

Mínimo: LocalStorage
Bônus: Banco de dados backend (Laravel + MySQL/PostgreSQL)
Estrutura de dados deve ser serializável em JSON


4. Histórico de Contratações (Consulta)
Requisitos:

✅ Exibir todas as contratações enviadas anteriormente
✅ Mostrar: Nome do artista, data do evento, nome do cliente, endereço
✅ Opção de retornar para pesquisa/nova contratação


💻 Padrões de Qualidade de Código (CRÍTICO)
1. Organização de Código

// ✅ BOM - Semântico, claro, componentizado
// components/ArtistCard/ArtistCard.jsx
/**
 * ArtistCard Component
 * Displays individual artist information in search results
 * 
 * Componente ArtistCard
 * Exibe informações individuais do artista nos resultados de pesquisa
 * 
 * @param {Object} artist - Artist data from API / Dados do artista da API
 * @param {Function} onSelect - Callback when artist is selected / Callback quando artista é selecionado
 */
const ArtistCard = ({ artist, onSelect }) => {
  // Render artist information with image and name
  // Renderiza informações do artista com imagem e nome
  return (
    <div className="artist-card" onClick={() => onSelect(artist)}>
      <img src={artist.image} alt={artist.name} />
      <h3>{artist.name}</h3>
    </div>
  );
}

// ❌ RUIM - Sem comentários, nomenclatura confusa
const Card = ({ a, f }) => { /* ... */ }

2. Padrões de Comentários (OBRIGATÓRIO)
Todos os comentários DEVEM estar em Inglês com tradução em Português:
// ✅ FORMATO CORRETO
/**
 * Fetches artist data from Spotify API
 * Busca dados do artista da API do Spotify
 * 
 * @param {string} query - Search term / Termo de busca
 * @returns {Promise<Array>} Artist list / Lista de artistas
 */
async function fetchArtists(query) {
  // Validate query before API call
  // Valida a query antes da chamada à API
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  // Make API request to Spotify
  // Faz requisição à API do Spotify
  const response = await fetch(`${SPOTIFY_API}/search?q=${query}`);
  
  // Transform API response to application format
  // Transforma resposta da API para formato da aplicação
  const data = await response.json();
  return data.artists.items;
}

// ❌ ERRADO - Apenas em português ou sem tradução
// Busca artistas
function fetchArtists(query) { }
```

### 3. Estrutura de Componentes

**Cada componente DEVE:**
- ✅ Ser semântico e reutilizável
- ✅ Ter tipos de props claros (TypeScript ou PropTypes)
- ✅ Incluir comentários em inglês com tradução em português
- ✅ Seguir o princípio de responsabilidade única
- ✅ Ser armazenado em pastas individuais com estilos relacionados
```
src/
├── components/
│   ├── ArtistCard/
│   │   ├── ArtistCard.jsx
│   │   ├── ArtistCard.module.css
│   │   └── index.js
│   ├── BookingForm/
│   │   ├── BookingForm.jsx
│   │   ├── BookingForm.module.css
│   │   └── index.js
│   ├── SearchBar/
│   │   ├── SearchBar.jsx
│   │   ├── SearchBar.module.css
│   │   └── index.js

🎨 Requisitos de UI/UX
Responsividade (OBRIGATÓRIO)

✅ Abordagem mobile-first
✅ Breakpoints: Mobile (< 768px), Tablet (768px-1024px), Desktop (> 1024px)
✅ Controles touch-friendly em mobile

Princípios de Layout

✅ Navegação intuitiva - Usuário deve entender o fluxo sem instruções
✅ HTML semântico - Uso adequado de header, nav, main, section, article, etc.
✅ Acessível - Labels ARIA, navegação por teclado, contraste de cores
✅ Consistente - Design tokens reutilizáveis (cores, espaçamento, tipografia)

Feedback Visual (FUNCIONALIDADES BÔNUS)

✅ Estados de carregamento (spinners, skeletons)
✅ Mensagens de sucesso/erro (toasts, modais)
✅ Feedback de validação de inputs (erros inline)
✅ Estados de hover/focus em elementos interativos
✅ Animações e transições CSS

/* ✅ BOM - Transições suaves */
.button {
  transition: all 0.3s ease-in-out;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Animação de fade-in para cards de artistas */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.artist-card {
  animation: fadeIn 0.5s ease-out;
}

🔧 Padrões de Uso do Git
Formato de Mensagem de Commit (OBRIGATÓRIO)

# ✅ CORRETO - Semântico, descritivo
feat: add artist search with Spotify API integration
fix: resolve date validation bug in booking form
style: improve responsive layout for mobile devices
docs: update README with API setup instructions
refactor: reorganize component folder structure

# ❌ ERRADO - Vago, inútil
update
fix bug
changes
wip
atualizações
```

### Estratégia de Branches
```
main/master      ← Código pronto para produção
  ├── develop    ← Branch de integração
      ├── feature/artist-search
      ├── feature/booking-form
      ├── feature/booking-history
      ├── fix/date-validation
      ├── style/responsive-improvements
```

### Frequência de Commits
- ✅ Fazer commit após cada unidade lógica de trabalho
- ✅ Nunca fazer commit de código que não funciona para main/develop
- ✅ Usar mensagens de commit descritivas seguindo conventional commits

---

## 🚀 Checklist de Funcionalidades Bônus

| Funcionalidade | Prioridade | Status |
|----------------|------------|--------|
| Artistas em tendência no carregamento inicial | ALTA | ⬜ |
| Animações/transições CSS | MÉDIA | ⬜ |
| Lazy loading/paginação da API | ALTA | ⬜ |
| Integração com banco de dados backend | ALTA | ⬜ |
| Feedback visual do formulário (toasts) | MÉDIA | ⬜ |
| Validação de input com mensagens de erro | ALTA | ⬜ |
| Skeletons de carregamento | BAIXA | ⬜ |
| Toggle de modo escuro | BAIXA | ⬜ |

---

## ⚠️ REGRAS CRÍTICAS PARA ASSISTENTES DE IA

### FAZER ✅
1. **SEMPRE** comentar código em inglês com tradução em português
2. **SEMPRE** validar campos obrigatórios do formulário (Nome, Artista, Data)
3. **SEMPRE** manter estrutura HTML semântica
4. **SEMPRE** criar componentes reutilizáveis
5. **SEMPRE** seguir o fluxo de aplicação especificado
6. **SEMPRE** priorizar design responsivo
7. **SEMPRE** usar commits git significativos

### NÃO FAZER ❌
1. **NUNCA** remover validações de campos obrigatórios
2. **NUNCA** quebrar o fluxo pesquisa → seleção → formulário → sucesso
3. **NUNCA** usar HTML não-semântico (div soup)
4. **NUNCA** pular comentários em lógica complexa
5. **NUNCA** ignorar requisitos de design responsivo
6. **NUNCA** fazer commit de código sem teste adequado
7. **NUNCA** mudar o stack tecnológico sem autorização
8. **NUNCA** usar comentários apenas em português

---

## 📊 Critérios de Avaliação

### Distribuição de Pontuação

1. **Qualidade do Código (40%)**
   - Código semântico, limpo e claro
   - Componentização adequada
   - Comentários em inglês com traduções
   - Qualidade e utilidade dos comentários

2. **UI/UX (30%)**
   - Layout responsivo
   - HTML semântico
   - Componentes reutilizáveis
   - Apelo visual e melhores práticas

3. **Uso do Git (15%)**
   - Mensagens de commit significativas
   - Estratégia de branching adequada
   - Frequência lógica de commits

4. **Funcionalidades Bônus (15%)**
   - Exibição de artistas em tendência
   - Animações CSS
   - Paginação da API
   - Integração com banco de dados
   - Sistemas de feedback visual

---

## 🔄 Fluxo de Trabalho de Desenvolvimento

### Antes de Iniciar Qualquer Funcionalidade:
1. Ler este README completamente
2. Entender os critérios de aceitação
3. Planejar estrutura de componentes
4. Considerar implicações de design responsivo

### Durante o Desenvolvimento:
1. Escrever código semântico e comentado
2. Testar em múltiplos tamanhos de tela
3. Fazer commits frequentes com mensagens claras
4. Validar que todos os campos obrigatórios funcionam

### Antes de Submeter:
1. Verificar que todas as funcionalidades obrigatórias funcionam
2. Checar design responsivo em mobile/tablet/desktop
3. Garantir que todos os comentários são bilíngues (EN/PT)
4. Testar fluxo completo do usuário da pesquisa até confirmação de contratação

---

## 📝 Exemplo de Fluxo do Usuário
```
1. Usuário acessa a homepage
   ↓
2. Vê artistas em tendência (bônus) OU pesquisa vazia
   ↓
3. Digita "Taylor Swift" na pesquisa
   ↓
4. Grade/lista mostra artistas correspondentes
   ↓
5. Clica em um card de artista
   ↓
6. Formulário de contratação aparece com artista pré-selecionado
   ↓
7. Preenche campos obrigatórios: Nome, Data
   ↓
8. (Opcional) Adiciona cachê e endereço
   ↓
9. Envia formulário
   ↓
10. Vê mensagem de sucesso
    ↓
11. Opções: Nova contratação OU Ver histórico

🛠️ Instruções de Configuração
Antes de modificar o projeto, garantir:

Node.js 18+ instalado
Gerenciador de pacotes (npm/yarn/pnpm) disponível
Chaves de API configuradas (se usar Spotify/YouTube)
Git inicializado com .gitignore adequado


📞 Dúvidas ou Esclarecimentos?
NÃO:

Assumir requisitos quando em dúvida
Pular funcionalidades obrigatórias
Ignorar padrões de qualidade de código

FAZER:

Seguir este README estritamente
Pedir esclarecimento se especificações conflitarem
Documentar quaisquer suposições feitas


🔍 Estrutura de Dados de Exemplo
LocalStorage - Formato de Contratação

/**
 * Booking data structure stored in LocalStorage
 * Estrutura de dados de contratação armazenada no LocalStorage
 */
const bookingExample = {
  id: "uuid-v4-generated", // Unique identifier / Identificador único
  clientName: "João Silva", // Required field / Campo obrigatório
  selectedArtist: {
    id: "spotify-artist-id",
    name: "Taylor Swift", // Required field / Campo obrigatório
    image: "https://...",
    genre: "Pop"
  },
  fee: 50000, // Optional / Opcional
  eventDate: "2026-12-25", // Required field (ISO format) / Campo obrigatório (formato ISO)
  address: "Rua das Flores, 123 - São Paulo, SP", // Optional / Opcional
  createdAt: "2026-02-05T10:30:00Z" // Timestamp / Data de criação
};

// Array of all bookings / Array de todas as contratações
const allBookings = [bookingExample, /* ... */];

// Store in LocalStorage / Armazenar no LocalStorage
localStorage.setItem('artistBookings', JSON.stringify(allBookings));

🎯 Validações Obrigatórias
Validação de Campos do Formulário

/**
 * Form validation rules
 * Regras de validação do formulário
 */
const validationRules = {
  clientName: {
    required: true,
    minLength: 3,
    errorMessage: "Nome é obrigatório e deve ter pelo menos 3 caracteres"
  },
  selectedArtist: {
    required: true,
    errorMessage: "Selecione um artista"
  },
  eventDate: {
    required: true,
    validate: (date) => new Date(date) > new Date(),
    errorMessage: "Data do evento é obrigatória e deve ser futura"
  },
  fee: {
    required: false,
    validate: (value) => value >= 0,
    errorMessage: "Cachê deve ser um valor positivo"
  },
  address: {
    required: false
  }
};

🎨 Exemplos de Boas Práticas CSS
Design Tokens (Recomendado)
/**
 * CSS Variables for consistent theming
 * Variáveis CSS para tema consistente
 */
:root {
  /* Colors / Cores */
  --color-primary: #1DB954;
  --color-secondary: #191414;
  --color-text: #ffffff;
  --color-error: #e74c3c;
  --color-success: #2ecc71;
  
  /* Spacing / Espaçamento */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography / Tipografia */
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  
  /* Breakpoints (use em media queries) */
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
}

Última Atualização: 05/02/2026
Versão: 1.0
Mantido por: Parys-boop (vulgo Arthur)