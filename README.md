# CARTEIRA

PWA de controle financeiro pessoal e compartilhado, desenvolvido a partir da especificação mestre do projeto. O objetivo é ser simples no uso diário e rigoroso na consistência financeira.

## Estado atual

A fundação já usa um banco Neon real e Managed Better Auth. A primeira fatia vertical do frontend inclui:

- cadastro e login via Neon Auth;
- onboarding para criar a primeira carteira e conta;
- criação de membro proprietário junto da carteira;
- categorias iniciais reais;
- dashboard consultando saldos derivados de lançamentos;
- quick add de receita e despesa com validação de acesso no servidor;
- histórico de lançamentos;
- auditoria inicial de criação de lançamentos;
- manifest e service worker básicos de PWA.

O progresso completo está em [`CHECKLIST.md`](./CHECKLIST.md). Um item só deve ser marcado quando estiver implementado de verdade.

## Stack

- Next.js App Router + TypeScript
- React
- Neon PostgreSQL
- Managed Better Auth / Neon Auth
- Drizzle ORM + Neon serverless driver
- Zod
- Vitest

## Configuração

1. Copie `.env.example` para `.env.local`.
2. Preencha `DATABASE_URL` com a string de conexão do projeto Neon.
3. Gere `NEON_AUTH_COOKIE_SECRET` com pelo menos 32 caracteres aleatórios.
4. Mantenha `NEON_AUTH_BASE_URL` apontando para o Auth provisionado no Neon.
5. Instale dependências e execute:

```bash
npm install
npm run dev
```

Nunca coloque a `DATABASE_URL` real ou o cookie secret no Git.

## Banco

A migration aplicada no Neon está versionada em `drizzle/0001_foundation.sql`. O banco registra migrations também em `public.schema_migrations`.

O saldo não é atualizado manualmente em vários lugares: `public.account_balances` deriva saldo atual e projetado a partir do saldo inicial e dos lançamentos válidos.

## Segurança multi-tenant

Toda leitura e mutação implementada nesta fatia recebe o usuário autenticado no servidor e valida que ele pertence à carteira. As funções `can_read_wallet`, `can_edit_wallet` e `can_admin_wallet` já existem no banco. A camada completa de RLS ainda deve ser concluída antes de considerar a fundação encerrada.

## Regra de desenvolvimento

Nada exibido como concluído pode ser apenas mock. Recursos que ainda não funcionam ficam fora da interface principal ou explicitamente indisponíveis até a implementação real.
