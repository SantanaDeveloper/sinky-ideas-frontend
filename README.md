# Sinky Ideias - Plataforma de Votação de Ideias

Uma aplicação Next.js moderna integrada com backend real para descobrir e votar nas melhores ideias da comunidade.

## 🚀 Funcionalidades

- **Autenticação JWT**: Sistema completo de login/registro  
- **Lista de Ideias**: Visualização performática de todas as ideias ordenadas por votos  
- **Sistema de Votação**: Vote em suas ideias favoritas (1 voto por usuário)  
- **Criação de Ideias**: Usuários autenticados podem criar novas ideias  
- **Gerenciamento**: Criadores podem editar/excluir suas ideias  
- **Interface Responsiva**: Design adaptável para desktop e mobile  
- **Tema Claro/Escuro**: Suporte completo a temas com persistência  
- **Atualizações Otimistas**: Interface reativa com fallback para erros  
- **Dashboard Admin**: Painel administrativo completo  
- **Gerenciamento de Usuários**: Controle de roles e permissões  

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router  
- **TypeScript** - Tipagem estática  
- **JWT** - Autenticação via JSON Web Tokens  
- **Axios** - Cliente HTTP para comunicação com API  
- **Tailwind CSS** - Estilização utilitária  
- **shadcn/ui** - Componentes de interface  
- **Sonner** - Sistema de notificações  
- **next-themes** - Gerenciamento de temas  

## 📦 Instalação

1. Clone o repositório:  
   ```bash
   git clone https://github.com/SantanaDeveloper/sinky-ideas-frontend
   cd sinky-ideas-frontend
   ```

2. Instale as dependências:  
   ```bash
   # npm
   npm install

   # yarn
   yarn install

   # pnpm
   pnpm install
   ```

3. Configure as variáveis de ambiente:  
   ```bash
   cp .env.local.example .env.local
   # Em seguida, abra o arquivo `.env.local` e configure:
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. Execute o projeto em modo de desenvolvimento:  
   ```bash
   # npm
   npm run dev

   # yarn
   yarn dev

   # pnpm
   pnpm dev
   ```

5. Abra no navegador:  
   ```
   http://localhost:3000
   ```

## 🔧 Configuração do Backend

> **IMPORTANTE**: Esta aplicação requer um backend real rodando na URL configurada em `NEXT_PUBLIC_API_URL`.

O backend deve implementar as seguintes rotas:

### Autenticação

- `POST /auth/signup` — Registro de usuários  
- `POST /auth/login` — Login (retorna JWT + votedPolls)  

### Ideias

- `GET /ideas` — Lista todas as ideias  
- `POST /ideas` — Cria nova ideia (autenticado)  
- `POST /ideas/{id}/vote` — Vota na ideia (autenticado)  
- `PATCH /ideas/{id}` — Atualiza ideia (criador/admin)  
- `DELETE /ideas/{id}` — Exclui ideia (criador/admin)  

### Usuários

- `GET /users` — Lista usuários (admin)  
- `GET /users/me/votes` — Ideias votadas pelo usuário  
- `PATCH /users/{id}/role` — Atualiza role do usuário (admin)  

## 🏗️ Estrutura do Projeto

```plaintext
├── app/
│   ├── admin/             # Páginas administrativas
│   ├── explore/           # Página de exploração
│   ├── trending/          # Página de tendências
│   ├── my-votes/          # Página de votos do usuário
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página principal
├── components/
│   ├── admin/             # Componentes administrativos
│   ├── auth/              # Componentes de autenticação
│   ├── ideas/             # Componentes de ideias
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── idea-card.tsx      # Card individual de ideia
│   ├── ideas-list.tsx     # Lista de ideias com estado
│   ├── loading-skeleton.tsx # Skeleton de carregamento
│   └── trending-ideas.tsx # Componente de destaques
├── lib/
│   ├── api.ts             # Cliente da API (Axios)
│   ├── axios-config.ts    # Configuração do Axios
│   ├── auth.ts            # Gerenciamento de autenticação
│   ├── api-endpoints.ts   # Constantes de endpoints
│   └── api-types.ts       # Tipos de requests/responses
└── types/
    └── idea.ts            # Definições de tipos TypeScript
```

## 🔐 Autenticação

- Tokens JWT são armazenados no `localStorage`  
- Cabeçalhos de autorização são incluídos automaticamente nas requisições  
- Verificação automática de expiração do token  
- Sincronização de votos via `votedPolls`  
- Menu contextual para usuários logados  

## 🎯 Scripts Disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento  
- `npm run build` — Cria build de produção  
- `npm run start` — Inicia servidor de produção  
- `npm run lint` — Executa linting do código  

## 📱 Responsividade

O design é otimizado para:

- **Desktop** (1024px+)  
- **Tablet** (768px–1023px)  
- **Mobile** (320px–767px)  

## 🎨 Temas

- Suporte a temas claro e escuro  
- Detecção automática do tema do sistema  
- Persistência da preferência do usuário  
- Transições suaves entre temas  

## 🚀 Deploy

1. Configure as variáveis de ambiente no provedor de hosting  
2. Execute `npm run build`  
3. Execute `npm run start` ou use o comando específico do provedor  

## 🔧 Troubleshooting

### Erro de Conexão

- Verifique se o backend está rodando  
- Cheque se `NEXT_PUBLIC_API_URL` está correta  
- Garanta que não haja problemas de CORS  

### Token Expirado

- Faça logout e login novamente  

### API não encontrada

- Verifique a URL e se o backend implementa todas as rotas  


## 📊 Funcionalidades Administrativas

- Painel com estatísticas em tempo real  
- Gerenciamento de usuários e roles  
- Monitoramento de atividades  
- Relatórios de ideias mais votadas  
