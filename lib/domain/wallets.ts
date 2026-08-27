import 'server-only';
import { sql } from '@/lib/db/client';
import { moneyToDecimal } from '@/lib/validation/finance';

type WalletSummary = {
  id: string;
  name: string;
  timezone: string;
  currency: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
};

export async function listWallets(userId: string): Promise<WalletSummary[]> {
  const rows = await sql`
    SELECT w.id, w.name, w.timezone, w.currency, wm.role
    FROM public.wallet_members wm
    JOIN public.wallets w ON w.id = wm.wallet_id
    WHERE wm.user_id = ${userId}::uuid AND w.archived_at IS NULL
    ORDER BY w.created_at ASC
  `;
  return rows as WalletSummary[];
}

function slugify(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'carteira';
}

export async function createWalletWithFirstAccount(input: {
  userId: string;
  walletName: string;
  accountName: string;
  accountType: string;
  openingBalance: string;
}) {
  const baseSlug = slugify(input.walletName);
  const suffix = crypto.randomUUID().slice(0, 8);
  const slug = `${baseSlug}-${suffix}`;
  const balance = moneyToDecimal(input.openingBalance);

  const result = await sql`
    WITH new_wallet AS (
      INSERT INTO public.wallets (owner_id, name, slug)
      VALUES (${input.userId}::uuid, ${input.walletName}, ${slug})
      RETURNING id
    ), new_member AS (
      INSERT INTO public.wallet_members (wallet_id, user_id, role)
      SELECT id, ${input.userId}::uuid, 'owner' FROM new_wallet
      RETURNING wallet_id
    ), new_account AS (
      INSERT INTO public.financial_accounts
        (wallet_id, name, account_type, opening_balance, opening_balance_date, created_by)
      SELECT id, ${input.accountName}, ${input.accountType}, ${balance}::numeric, CURRENT_DATE, ${input.userId}::uuid
      FROM new_wallet
      RETURNING id, wallet_id
    ), default_categories AS (
      INSERT INTO public.categories (wallet_id, name, applies_to, sort_order, created_by)
      SELECT nw.id, c.name, c.applies_to, c.sort_order, ${input.userId}::uuid
      FROM new_wallet nw
      CROSS JOIN (VALUES
        ('Moradia','expense',10),('Alimentação','expense',20),('Transporte','expense',30),
        ('Saúde','expense',40),('Lazer','expense',50),('Renda','income',60),('Outros','both',99)
      ) AS c(name, applies_to, sort_order)
      RETURNING id
    )
    SELECT nw.id AS wallet_id, na.id AS account_id
    FROM new_wallet nw
    JOIN new_account na ON na.wallet_id = nw.id
  `;

  const row = result[0] as { wallet_id: string; account_id: string } | undefined;
  if (!row) throw new Error('Não foi possível criar a carteira.');
  return row;
}

export async function getWalletAccess(walletId: string, userId: string) {
  const rows = await sql`
    SELECT w.id, w.name, wm.role
    FROM public.wallets w
    JOIN public.wallet_members wm ON wm.wallet_id = w.id
    WHERE w.id = ${walletId}::uuid AND wm.user_id = ${userId}::uuid AND w.archived_at IS NULL
    LIMIT 1
  `;
  return (rows[0] as { id: string; name: string; role: string } | undefined) ?? null;
}
