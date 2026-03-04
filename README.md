# 🎵 Plataforma de Contratação de Artistas

Aplicação web para pesquisar artistas (bandas e cantores) e enviar solicitações de contratação para shows e eventos particulares.

## ✨ Funcionalidades

- **Pesquisa de Artistas** — Busca em tempo real integrada à API do Spotify com debounce automático.
- **Artistas Populares** — Exibição de artistas em tendência na página inicial.
- **Navegação por Gênero** — Seção de artistas organizada por gênero musical.
- **Modal de Artista** — Visualização de detalhes do artista antes de contratar.
- **Formulário de Contratação** — Criação de eventos com validação dos campos:
  - Nome do Cliente (obrigatório)
  - Data do Evento — somente datas futuras (obrigatório)
  - Cachê (opcional, valor positivo)
  - Endereço do Evento (opcional)
- **Histórico de Contratações** — Consulta de todos os eventos criados.
- **Autenticação** — Cadastro e login de usuários com e-mail e senha.

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 | Framework principal (App Router) |
| [React](https://react.dev/) | 19 | Interface de usuário |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Tipagem estática |
| [Tailwind CSS](https://tailwindcss.com/) | 4 | Estilização |
| [MongoDB](https://www.mongodb.com/) | 6 | Banco de dados |
| [NextAuth.js](https://next-auth.js.org/) | 4 | Autenticação |
| [Axios](https://axios-http.com/) | 1 | Requisições HTTP |
| [React Hook Form](https://react-hook-form.com/) | 7 | Gestão de formulários |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3 | Hash de senhas |

## 📂 Estrutura do Projeto

```
├── app/                        # Rotas da aplicação (App Router)
│   ├── api/                    # API Routes do Next.js
│   │   ├── auth/               # Endpoints de autenticação (NextAuth)
│   │   ├── eventos/            # CRUD de eventos/contratações
│   │   ├── searchArtists/      # Proxy para a API do Spotify
│   │   └── usuarios/           # Cadastro de usuários
│   ├── auth/
│   │   ├── login/              # Página de login
│   │   └── cadastro/           # Página de cadastro
│   ├── eventos/
│   │   ├── criar/              # Formulário de contratação
│   │   └── historico/          # Histórico de contratações
│   └── page.tsx                # Página inicial (busca + artistas populares)
├── components/                 # Componentes reutilizáveis
│   ├── ArtistCard/             # Card de artista nos resultados
│   ├── ArtistModal/            # Modal com detalhes do artista
│   ├── AuthModal/              # Modal de autenticação
│   ├── BookingForm/            # Formulário de contratação
│   ├── BookingHistory/         # Listagem do histórico
│   ├── BookingSuccess/         # Tela de confirmação de contratação
│   ├── SearchBar/              # Barra de busca
│   ├── SectionPopulares/       # Seção de artistas populares
│   └── SectionPorGenero/       # Seção de artistas por gênero
├── data/                       # Dados estáticos (gêneros musicais)
├── hooks/                      # Custom hooks (ex: useRequireAuth)
├── lib/                        # Configurações (MongoDB, NextAuth)
├── utils/                      # Funções utilitárias (api, validação, storage)
└── public/                     # Ativos estáticos
```

## 🚀 Como Executar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Conta no [MongoDB Atlas](https://www.mongodb.com/atlas) (ou instância local do MongoDB)
- Credenciais da [API do Spotify](https://developer.spotify.com/dashboard)

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/<banco>

# Spotify API
SPOTIFY_CLIENT_ID=seu_client_id_do_spotify
SPOTIFY_CLIENT_SECRET=seu_client_secret_do_spotify

# NextAuth
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=uma_string_secreta_aleatoria
```

> **Como obter as credenciais do Spotify:**
> 1. Acesse o [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
> 2. Crie um novo aplicativo
> 3. Copie o **Client ID** e o **Client Secret**

### 3. Executar em modo de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |
| `npm run test:crud:eventos` | Testa as operações CRUD de eventos |

## 🔄 Fluxo da Aplicação

```
1. Usuário acessa a homepage
   ↓
2. Vê artistas populares / pesquisa por nome
   ↓
3. Clica em um artista → abre modal de detalhes
   ↓
4. Clica em "Contratar" → redirecionado para login (se não autenticado)
   ↓
5. Preenche o formulário de contratação (nome, data, cachê, endereço)
   ↓
6. Envia o formulário → tela de sucesso
   ↓
7. Opções: Nova contratação ou Ver histórico
```

## 🌐 Rotas

| Rota | Descrição |
|---|---|
| `/` | Página inicial com busca e artistas populares |
| `/auth/login` | Login de usuário |
| `/auth/cadastro` | Cadastro de novo usuário |
| `/eventos/criar` | Formulário para criar contratação |
| `/eventos/historico` | Histórico de contratações do usuário |