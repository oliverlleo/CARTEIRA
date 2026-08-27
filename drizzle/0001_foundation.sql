-- 0001_foundation
-- Base aplicada no Neon em 2026-08-27. Não armazena credenciais.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80), slug text NOT NULL,
  timezone text NOT NULL DEFAULT 'America/Sao_Paulo', currency char(3) NOT NULL DEFAULT 'BRL', is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
  UNIQUE(owner_id, slug)
);
CREATE TABLE IF NOT EXISTS public.wallet_members (
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','editor','viewer')), joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(wallet_id,user_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS wallet_single_owner_idx ON public.wallet_members(wallet_id) WHERE role='owner';
CREATE INDEX IF NOT EXISTS wallet_members_user_idx ON public.wallet_members(user_id, wallet_id);

CREATE TABLE IF NOT EXISTS public.wallet_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, email text, token_hash text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin','editor','viewer')), status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at timestamptz NOT NULL, accepted_by uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL, accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wallet_invitations_wallet_idx ON public.wallet_invitations(wallet_id,status,expires_at);

CREATE TABLE IF NOT EXISTS public.financial_institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100), kind text NOT NULL DEFAULT 'bank' CHECK (kind IN ('bank','fintech','broker','cash','other')),
  created_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz
);
CREATE INDEX IF NOT EXISTS financial_institutions_wallet_idx ON public.financial_institutions(wallet_id,archived_at);

CREATE TABLE IF NOT EXISTS public.financial_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES public.financial_institutions(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100), account_type text NOT NULL CHECK (account_type IN ('checking','digital','savings','cash','wallet','business','investment','other')),
  currency char(3) NOT NULL DEFAULT 'BRL', opening_balance numeric(19,4) NOT NULL DEFAULT 0, opening_balance_date date NOT NULL DEFAULT CURRENT_DATE,
  hide_balance boolean NOT NULL DEFAULT false, notes text, created_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz
);
CREATE INDEX IF NOT EXISTS financial_accounts_wallet_idx ON public.financial_accounts(wallet_id,archived_at);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.categories(id) ON DELETE RESTRICT, name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80),
  applies_to text NOT NULL DEFAULT 'expense' CHECK (applies_to IN ('income','expense','both')), icon text, sort_order integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz,
  CHECK (parent_id IS NULL OR parent_id <> id)
);
CREATE UNIQUE INDEX IF NOT EXISTS categories_wallet_parent_name_idx ON public.categories(wallet_id,COALESCE(parent_id,'00000000-0000-0000-0000-000000000000'::uuid),lower(name)) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS categories_wallet_idx ON public.categories(wallet_id,parent_id,sort_order);

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 60), created_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(), archived_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS tags_wallet_name_idx ON public.tags(wallet_id,lower(name)) WHERE archived_at IS NULL;

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.financial_accounts(id) ON DELETE RESTRICT,
  kind text NOT NULL CHECK (kind IN ('income','expense','transfer','opening_balance','card_payment','refund','adjustment')),
  direction text NOT NULL CHECK (direction IN ('credit','debit')), status text NOT NULL DEFAULT 'realized' CHECK (status IN ('forecast','pending','realized','reconciled','cancelled')),
  amount numeric(19,4) NOT NULL CHECK (amount > 0), description text NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 240),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL, occurred_on date NOT NULL, due_on date, competence_on date, reconciled_at timestamptz,
  notes text, external_id text, source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','schedule','import','system','api')), idempotency_key text,
  created_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT, updated_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS transactions_wallet_idempotency_idx ON public.transactions(wallet_id,idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_wallet_date_idx ON public.transactions(wallet_id,occurred_on DESC,id DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_account_date_idx ON public.transactions(account_id,occurred_on DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_category_idx ON public.transactions(wallet_id,category_id,occurred_on DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.transaction_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT, amount numeric(19,4) NOT NULL CHECK (amount > 0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transaction_splits_transaction_idx ON public.transaction_splits(transaction_id);
CREATE TABLE IF NOT EXISTS public.transaction_tags (
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE, tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY(transaction_id,tag_id)
);

CREATE TABLE IF NOT EXISTS public.transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  source_transaction_id uuid NOT NULL UNIQUE REFERENCES public.transactions(id) ON DELETE RESTRICT,
  destination_transaction_id uuid NOT NULL UNIQUE REFERENCES public.transactions(id) ON DELETE RESTRICT,
  amount numeric(19,4) NOT NULL CHECK (amount > 0), transferred_on date NOT NULL, created_by uuid NOT NULL REFERENCES neon_auth."user"(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(), CHECK(source_transaction_id <> destination_transaction_id)
);
CREATE INDEX IF NOT EXISTS transfers_wallet_date_idx ON public.transfers(wallet_id,transferred_on DESC);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id bigserial PRIMARY KEY, wallet_id uuid REFERENCES public.wallets(id) ON DELETE CASCADE, actor_user_id uuid REFERENCES neon_auth."user"(id) ON DELETE SET NULL,
  action text NOT NULL, entity_type text NOT NULL, entity_id uuid, summary text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_wallet_created_idx ON public.audit_logs(wallet_id,created_at DESC);
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key text PRIMARY KEY, wallet_id uuid REFERENCES public.wallets(id) ON DELETE CASCADE, operation text NOT NULL, result_ref uuid,
  created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz
);

CREATE OR REPLACE VIEW public.account_balances AS
SELECT a.id AS account_id,a.wallet_id,
  a.opening_balance + COALESCE(SUM(CASE WHEN t.status IN ('realized','reconciled') AND t.deleted_at IS NULL THEN CASE WHEN t.direction='credit' THEN t.amount ELSE -t.amount END ELSE 0 END),0) AS current_balance,
  a.opening_balance + COALESCE(SUM(CASE WHEN t.status IN ('forecast','pending','realized','reconciled') AND t.deleted_at IS NULL THEN CASE WHEN t.direction='credit' THEN t.amount ELSE -t.amount END ELSE 0 END),0) AS projected_balance
FROM public.financial_accounts a LEFT JOIN public.transactions t ON t.account_id=a.id
GROUP BY a.id,a.wallet_id,a.opening_balance;

CREATE OR REPLACE FUNCTION public.wallet_role(p_wallet_id uuid,p_user_id uuid) RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT role FROM public.wallet_members WHERE wallet_id=p_wallet_id AND user_id=p_user_id LIMIT 1
$$;
CREATE OR REPLACE FUNCTION public.can_read_wallet(p_wallet_id uuid,p_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT EXISTS(SELECT 1 FROM public.wallet_members WHERE wallet_id=p_wallet_id AND user_id=p_user_id)
$$;
CREATE OR REPLACE FUNCTION public.can_edit_wallet(p_wallet_id uuid,p_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT EXISTS(SELECT 1 FROM public.wallet_members WHERE wallet_id=p_wallet_id AND user_id=p_user_id AND role IN ('owner','admin','editor'))
$$;
CREATE OR REPLACE FUNCTION public.can_admin_wallet(p_wallet_id uuid,p_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT EXISTS(SELECT 1 FROM public.wallet_members WHERE wallet_id=p_wallet_id AND user_id=p_user_id AND role IN ('owner','admin'))
$$;

INSERT INTO public.schema_migrations(version) VALUES ('0001_foundation') ON CONFLICT DO NOTHING;
