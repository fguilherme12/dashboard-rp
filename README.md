# Dashboard RP — CCO / Atendimento

Dashboard Next.js para gestão de demandas e atendentes do CCO, com persistência via Supabase.

## Funcionalidades

- **Dashboard** — cards com total, pendentes, em atendimento, finalizadas e média de tempo
- **Atendentes** — CRUD completo com modal, paginação e cards no mobile
- **Demandas** — CRUD completo com edição inline (atendente, status, comentário), paginação e cards no mobile
- **Sidebar** — navegação entre rotas `/dashboard`, `/atendentes` e `/demandas`

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL + API REST)
- Lucide React (ícones)

## Configuração local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No **SQL Editor**, execute o script `supabase/schema.sql`
3. Em **Project Settings → API**, copie a URL e a chave `anon public`

### 3. Variáveis de ambiente

Copie o arquivo de exemplo e preencha:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Deploy na Vercel

1. Faça push do repositório para o GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático — a Vercel detecta Next.js nativamente

## Estrutura do banco

### `attendants`
| Campo | Tipo |
|-------|------|
| id | UUID |
| name | TEXT |
| created_at | TIMESTAMPTZ |

### `demands`
| Campo | Tipo |
|-------|------|
| id | UUID |
| date | DATE |
| demand_time | TIME |
| type | TEXT (`TMS`, `TMS+CSV`) |
| requester | TEXT |
| attendant_id | UUID (FK) |
| service_time | TIME |
| completion_time | TIMESTAMPTZ |
| status | TEXT (`pendente`, `em_atendimento`, `finalizada`) |
| comment | TEXT |
| created_at | TIMESTAMPTZ |

## Segurança

As políticas RLS atuais são permissivas para facilitar o uso sem autenticação. Para produção, recomenda-se implementar autenticação Supabase Auth e restringir as políticas RLS.
