# 🎵 Contratação de Artistas

Uma aplicação web desenvolvida em **Next.js** para facilitar a pesquisa, visualização e contratação de artistas e bandas para eventos.

## 📋 Sobre o Projeto

Este projeto permite aos utilizadores ("clientes") navegar por uma lista de artistas, visualizar os seus detalhes e submeter pedidos de contratação. O sistema inclui validação de formulários e gestão de estados para garantir uma experiência de utilizador fluida.

## ✨ Funcionalidades Principais

* **Listagem de Artistas:** Visualização de artistas com imagem, nome e género musical através do componente `ArtistCard`.
* **Sistema de Contratação:** Formulário interativo (`BookingForm`) que recolhe informações essenciais para o evento:
    * Nome do Cliente (Obrigatório).
    * Data do Evento (Validação para datas futuras).
    * Cachê/Fee (Opcional, com validação numérica).
    * Endereço do Evento.
* **Validação de Dados:** Utilização de lógica de validação personalizada para garantir a integridade dos dados antes do envio.
* **Interface Responsiva:** Estilização moderna utilizando Tailwind CSS.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído com as seguintes tecnologias principais:

* **[Next.js 16](https://nextjs.org/)**: Framework React para produção.
* **[React 19](https://react.dev/)**: Biblioteca para construção de interfaces.
* **[Tailwind CSS 4](https://tailwindcss.com/)**: Framework de CSS utilitário para estilização rápida.
* **[React Hook Form](https://react-hook-form.com/)**: Gestão eficiente de formulários.
* **[Axios](https://axios-http.com/)**: Cliente HTTP para requisições.
* **TypeScript**: Tipagem estática.

## 📂 Estrutura do Projeto

A estrutura principal dos ficheiros relevantes é a seguinte:

```bash
├── app/                  # Diretório da aplicação (App Router)
├── components/           # Componentes reutilizáveis
│   ├── ArtistCard/       # Componente de visualização do artista
│   ├── BookingForm/      # Formulário de contratação com validação
│   ├── BookingHistory/   # Histórico de agendamentos
│   └── SearchBar/        # Barra de pesquisa
├── data/                 # Dados estáticos (ex: artists.json)
├── utils/                # Funções utilitárias (api.js, storage.js, validation.js)
└── public/               # Ativos estáticos (imagens, ícones)

🚀 Como Executar Localmente
Siga os passos abaixo para executar o projeto no seu ambiente local:

Pré-requisitos: Certifique-se de que tem o Node.js instalado.

Instalar dependências:

npm install
# ou
yarn install

Executar o servidor de desenvolvimento:

npm run dev
# ou
yarn dev

Aceder à aplicação: Abra o seu navegador e visite http://localhost:3000.

📜 Scripts Disponíveis
No ficheiro package.json, estão definidos os seguintes scripts:

npm run dev: Inicia o ambiente de desenvolvimento.

npm run build: Cria a versão otimizada para produção.

npm run start: Inicia o servidor de produção.

npm run lint: Executa o ESLint para verificação de código.