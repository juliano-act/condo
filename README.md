# CondoConnect

Portal condominial com backend real em `Next.js`, autenticacao por sessao, banco relacional e fluxo operacional para avisos, reservas de areas comuns e manutencoes.

## Stack atual

- `Next.js 16` com App Router e Server Actions
- `Prisma ORM`
- `SQLite` para desenvolvimento local
- Sessao autenticada com `httpOnly cookie` e `jose`
- `Tailwind CSS 4`

## Modulos implementados

### Morador
- Cadastro e login
- Reserva de areas comuns com validacao de conflito de horario
- Acompanhamento das proprias reservas
- Abertura de solicitacoes de manutencao
- Acompanhamento do status das proprias solicitacoes

### Publico
- Mural de avisos aberto
- Home com destaques e ultimos comunicados

### Administracao
- Publicacao de avisos
- Cadastro de areas comuns
- Aprovacao, recusa e cancelamento de reservas
- Atualizacao de status das manutencoes

## Banco de dados recomendado

### Desenvolvimento local
- `PostgreSQL` via Docker Compose
- Motivo: ambiente local mais proximo da producao e sem divergencia de provider do Prisma

### Producao
- `PostgreSQL` gerenciado
- Opcoes praticas: `Neon`, `Supabase`, `Amazon RDS`, `Cloud SQL`
- Motivo: concorrencia melhor, backup, observabilidade e operacao mais segura que `SQLite`

## Funcionalidades recomendadas para a proxima fase

- Upload de imagens para manutencao em storage S3 compativel
- Recuperacao de senha por email
- Notificacoes por email ou WhatsApp para reservas e manutencoes
- Cadastro de moradores por bloco/unidade com perfis
- Controle financeiro e boletos
- Assembleia, votacao e documentos
- Relatorios administrativos
- Logs de auditoria

## Executando localmente

### Requisitos

- `Node.js 20+`
- `npm`

### Passos

1. Instale as dependencias:

```bash
npm install
```

2. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

3. Suba o PostgreSQL local:

```bash
npm run db:start
```

4. Gere o banco e aplique a migracao inicial:

```bash
npm run db:migrate -- --name init
```

5. Popule dados de exemplo:

```bash
npm run db:seed
```

6. Inicie o projeto:

```bash
npm run dev
```

### Encerrando o banco local

```bash
npm run db:stop
```

## Credenciais de seed

- Admin: `admin@condoconnect.local`
- Senha: `Admin12345!`

- Morador: `morador@condoconnect.local`
- Senha: `Morador123!`

## Deploy recomendado

### Aplicacao

- `Node.js 20+`
- `npm ci`
- `npm run db:deploy`
- `npx prisma generate`
- `npm run build`
- `npm run start`

### Banco

- Para producao, use `PostgreSQL` gerenciado
- Opcoes praticas: `Neon`, `Supabase`, `Amazon RDS`, `Cloud SQL`
- Aplique migracoes com `npm run db:deploy`

### Variaveis de ambiente

- `DATABASE_URL`
- `SESSION_SECRET`

## Observacoes

- O projeto foi validado com `npm run lint` e `npm run build`.
- O banco local esperado agora e `PostgreSQL`.
