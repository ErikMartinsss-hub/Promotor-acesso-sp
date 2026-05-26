<div align="center">
  <h1>AcessPromo</h1>
  <p><strong>Controle de Acesso para Promotores</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
    <img src="https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/Vercel-000?logo=vercel&logoColor=white" alt="Vercel" />
  </p>
</div>

---

## Sobre

Sistema web para gestão de acesso de promotores em eventos, lojas e estabelecimentos. Administradores cadastram promotores vinculados a marcas e redes, cada promotor recebe um QR Code único para registrar entrada e saída, e todas as visitas são monitoradas em tempo real.

---

## Funcionalidades

- **Autenticação** — Login seguro para administradores e promotores (Firebase Auth)
- **Cadastro Público** — Promotores fazem self-registration com geração automática de QR Code
- **QR Code** — Cada promotor possui um QR Code único para registrar acessos
- **Registro de Visitas** — Entrada e saída por leitura de QR Code ou busca manual
- **Dashboard** — Visão geral com métricas e visitas recentes
- **Gestão de Redes** — CRUD de redes/lojas
- **Gestão de Marcas** — CRUD de marcas/prestadoras com CNPJ e Razão Social
- **Gestão de Promotores** — Cadastro, edição, busca e detalhamento
- **Gestão de Usuários** — Controle de acesso administrativo (admin/manager/operator)
- **Recuperação de Senha** — Envio de link de redefinição via SMS
- **Responsivo** — Interface adaptável para desktop e mobile

---

## Stack

| Categoria | Tecnologia |
|-----------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 4 |
| **Backend** | Firebase (Auth + Firestore), Firebase Admin SDK |
| **Ícones** | Lucide React |
| **QR Code** | qrcode.react (geração), @yudiel/react-qr-scanner (leitura) |
| **Server Local** | Express 5 + Concurrently |
| **Deploy** | Vercel (frontend + serverless functions) |

---

## Começando

### Pré-requisitos

- Node.js 18+
- npm
- Conta Firebase com projeto ativo
- (Opcional) Conta Vercel para deploy

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```env
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### Instalação

```bash
npm install
```

### Executar em Desenvolvimento

```bash
# Apenas frontend
npm run dev

# Frontend + servidor Express local
npm run dev:all
```

O frontend inicia em `http://localhost:5173` e o servidor em `http://localhost:3001`.

### Build

```bash
npm run build
```

Gera os arquivos estáticos na pasta `dist/`.

---

## Estrutura do Projeto

```
acess-promo/
├── api/                    # Serverless functions (Vercel)
│   ├── _firebase.js        # Firebase Admin init
│   ├── generate-reset-link.js
│   └── send-reset-sms.js
├── server/                 # Express server (desenvolvimento local)
│   └── index.cjs
├── src/
│   ├── assets/             # Imagens e recursos estáticos
│   ├── components/
│   │   ├── Layout.tsx      # Sidebar + header + conteúdo
│   │   └── ProtectedRoute.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   ├── firebase/
│   │   └── config.ts        # Configuração do Firebase
│   ├── lib/
│   │   └── firestore.ts     # Operações CRUD no Firestore
│   ├── pages/              # Páginas da aplicação
│   ├── types/
│   │   └── index.ts        # Interfaces TypeScript
│   ├── App.tsx             # Rotas
│   ├── index.css
│   └── main.tsx            # Entry point
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vercel.json
├── vite.config.ts
└── eslint.config.js
```

---

## Rotas

### Públicas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Landing | Página inicial |
| `/register` | Cadastro | Self-registration do promotor |
| `/promoter-login` | Login Promotor | Login do promotor |
| `/my-qr` | Meu QR Code | QR Code do promotor logado |

### Administrativas (requer autenticação)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | Login Admin | Login administrativo |
| `/dashboard` | Dashboard | Métricas e resumo |
| `/entry` | Registrar Acesso | Leitura de QR Code / entrada manual |
| `/entry/:id` | Registrar Acesso | Acesso direto por ID |
| `/promoters` | Promotores | Lista de promotores |
| `/promoters/new` | Novo Promotor | Cadastro de promotor |
| `/promoters/:id` | Detalhe Promotor | Visualizar/editar promotor |
| `/visits` | Visitas | Histórico de visitas |
| `/networks` | Redes | Gerenciar redes (admin) |
| `/brands` | Marcas | Gerenciar marcas (admin) |
| `/users` | Usuários | Gerenciar usuários (admin) |

---

## Modelo de Dados (Firestore)

### `networks`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome da rede |
| `slug` | string | Identificador único |
| `active` | boolean | Ativa/inativa |

### `brands`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome interno |
| `razaoSocial` | string | Razão social |
| `cnpj` | string | CNPJ |
| `nomeFantasia` | string? | Nome fantasia |
| `active` | boolean | Ativa/inativa |

### `users` (usuários do sistema)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome completo |
| `email` | string | E-mail |
| `phone` | string | Telefone |
| `role` | enum | admin, manager, operator |
| `networkId` | string | Rede vinculada |
| `active` | boolean | Ativo/inativo |

### `promoters`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome completo |
| `cpf` | string | CPF (somente dígitos) |
| `phone` | string | Telefone |
| `email` | string | E-mail (usado como login) |
| `type` | enum | promoter, supervisor |
| `brandId` | string | Marca vinculada |
| `brandName` | string | Nome da marca (desnormalizado) |
| `networkId` | string | Rede vinculada |
| `networkName` | string | Nome da rede (desnormalizado) |
| `qrToken` | string | Token único do QR Code |
| `active` | boolean | Ativo/inativo |

### `visits`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `promoterId` | string | ID do promotor |
| `promoterName` | string | Nome do promotor |
| `brandName` | string | Marca do promotor |
| `networkId` | string | Rede |
| `date` | string | Data (YYYY-MM-DD) |
| `entryTime` | timestamp | Horário de entrada |
| `exitTime` | timestamp? | Horário de saída |
| `status` | enum | active, completed |

---

## API

### `POST /api/send-reset-sms`

Gera um link de redefinição de senha e envia via SMS.

**Body:**
```json
{ "cpf": "00000000000" }
```

**Response:**
```json
{ "success": true, "link": "https://..." }
```

### `POST /api/generate-reset-link`

Gera um link de redefinição de senha.

**Body:**
```json
{ "email": "promotor@email.com" }
```

**Response:**
```json
{ "link": "https://..." }
```

---

## Deploy

O projeto está configurado para deploy na **Vercel**.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Conecte o repositório do GitHub
2. Configure as variáveis de ambiente (`VITE_FIREBASE_*`)
3. O `vercel.json` já está configurado para SPA + serverless functions

Após o deploy, configure as credenciais do Firebase Admin como variável de ambiente `FIREBASE_SERVICE_ACCOUNT` (JSON string da service account).

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite) |
| `npm run dev:server` | Inicia servidor Express local |
| `npm run dev:all` | Inicia frontend + servidor simultaneamente |
| `npm run build` | Compila TypeScript e faz o build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |

---

## Licença

Este projeto é de uso interno e confidencial.
