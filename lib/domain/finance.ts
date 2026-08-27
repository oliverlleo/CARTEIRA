import 'server-only';
import { sql } from '@/lib/db/client';
import { moneyToDecimal } from '@/lib/validation/finance';

export async function getDashboard(walletId: string, userId: string) {
  const [summaryRows, accountRows, recentRows] = await Promise.all([
    sql`
      SELECT
        COALESCE(SUM(ab.current_balance),0)::text AS current_balance,
        COALESCE(SUM(ab.projected_balance),0)::text AS projected_balance,
        COALESCE((SELECT SUM(t.amount) FROM public.transactions t WHERE t.wallet_id=${walletId}::uuid AND t.kind='income' AND t.direction='credit' AND t.status IN ('realized','reconciled') AND date_trunc('month', t.occurred_on::timestamp)=date_trunc('month', CURRENT_DATE::timestamp) AND t.deleted_at IS NULL),0)::text AS month_income,
        COALESCE((SELECT SUM(t.amount) FROM public.transactions t WHERE t.wallet_id=${walletId}::uuid AND t.kind='expense' AND t.direction='debit' AND t.status IN ('realized','reconciled') AND date_trunc('month', t.occurred_on::timestamp)=date_trunc('month', CURRENT_DATE::timestamp) AND t.deleted_at IS NULL),0)::text AS month_expense
      FROM public.account_balances ab
      WHERE ab.wallet_id=${walletId}::uuid
        AND public.can_read_wallet(${walletId}::uuid, ${userId}::uuid)
    `,
    sql`
      SELECT a.id, a.name, a.account_type, a.hide_balance,
             ab.current_balance::text, ab.projected_balance::text
      FROM public.financial_accounts a
      JOIN public.account_balances ab ON ab.account_id=a.id
      WHERE a.wallet_id=${walletId}::uuid AND a.archived_at IS NULL
        AND public.can_read_wallet(${walletId}::uuid, ${userId}::uuid)
      ORDER BY a.created_at
    `,
    sql`
      SELECT t.id, t.description, t.kind, t.direction, t.amount::text, t.occurred_on::text,
             c.name AS category_name, a.name AS account_name
      FROM public.transactions t
      JOIN public.financial_accounts a ON a.id=t.account_id
      LEFT JOIN public.categories c ON c.id=t.category_id
      WHERE t.wallet_id=${walletId}::uuid AND t.deleted_at IS NULL
        AND public.can_read_wallet(${walletId}::uuid, ${userId}::uuid)
      ORDER BY t.occurred_on DESC, t.created_at DESC
      LIMIT 8
    `,
  ]);

  return {
    summary: summaryRows[0] as { current_balance: string; projected_balance: string; month_income: string; month_expense: string },
    accounts: accountRows as Array<{ id:string; name:string; account_type:string; hide_balance:boolean; current_balance:string; projected_balance:string }>,
    recent: recentRows as Array<{ id:string; description:string; kind:string; direction:string; amount:string; occurred_on:string; category_name:string|null; account_name:string }>,
  };
}

export async function getTransactionFormData(walletId: string, userId: string) {
  const [accounts, categories] = await Promise.all([
    sql`SELECT id,name FROM public.financial_accounts WHERE wallet_id=${walletId}::uuid AND archived_at IS NULL AND public.can_edit_wallet(${walletId}::uuid,${userId}::uuid) ORDER BY name`,
    sql`SELECT id,name,applies_to FROM public.categories WHERE wallet_id=${walletId}::uuid AND parent_id IS NULL AND archived_at IS NULL AND public.can_read_wallet(${walletId}::uuid,${userId}::uuid) ORDER BY sort_order,name`,
  ]);
  return { accounts: accounts as Array<{id:string;name:string}>, categories: categories as Array<{id:string;name:string;applies_to:string}> };
}

export async function createManualTransaction(input: {
  walletId: string; accountId: string; categoryId?: string; userId: string;
  kind: 'income'|'expense'; amount: string; description: string; occurredOn: string; notes?: string;
}) {
  const amount = moneyToDecimal(input.amount);
  const direction = input.kind === 'income' ? 'credit' : 'debit';
  const categoryId = input.categoryId || null;

  const rows = await sql`
    INSERT INTO public.transactions
      (wallet_id, account_id, kind, direction, status, amount, description, category_id, occurred_on, notes, source, created_by, updated_by)
    SELECT
      ${input.walletId}::uuid, a.id, ${input.kind}, ${direction}, 'realized', ${amount}::numeric,
      ${input.description}, ${categoryId}::uuid, ${input.occurredOn}::date, ${input.notes ?? null}, 'manual',
      ${input.userId}::uuid, ${input.userId}::uuid
    FROM public.financial_accounts a
    WHERE a.id=${input.accountId}::uuid
      AND a.wallet_id=${input.walletId}::uuid
      AND a.archived_at IS NULL
      AND public.can_edit_wallet(${input.walletId}::uuid, ${input.userId}::uuid)
      AND (${categoryId}::uuid IS NULL OR EXISTS (
        SELECT 1 FROM public.categories c
        WHERE c.id=${categoryId}::uuid AND c.wallet_id=${input.walletId}::uuid AND c.archived_at IS NULL
          AND (c.applies_to='both' OR c.applies_to=${input.kind})
      ))
    RETURNING id
  `;
  if (!rows[0]) throw new Error('Você não tem permissão ou os dados não pertencem a esta carteira.');

  await sql`
    INSERT INTO public.audit_logs (wallet_id, actor_user_id, action, entity_type, entity_id, summary)
    VALUES (${input.walletId}::uuid, ${input.userId}::uuid, 'create', 'transaction', ${(rows[0] as {id:string}).id}::uuid,
      ${input.kind === 'income' ? 'Receita adicionada' : 'Despesa adicionada'})
  `;
  return rows[0] as { id: string };
}

export async function listTransactions(walletId: string, userId: string) {
  const rows = await sql`
    SELECT t.id,t.description,t.kind,t.direction,t.status,t.amount::text,t.occurred_on::text,
           c.name AS category_name,a.name AS account_name
    FROM public.transactions t
    JOIN public.financial_accounts a ON a.id=t.account_id
    LEFT JOIN public.categories c ON c.id=t.category_id
    WHERE t.wallet_id=${walletId}::uuid AND t.deleted_at IS NULL
      AND public.can_read_wallet(${walletId}::uuid,${userId}::uuid)
    ORDER BY t.occurred_on DESC,t.created_at DESC
    LIMIT 100
  `;

  return rows as Array<{id:string;description:string;kind:string;direction:string;status:string;amount:string;occurred_on:string;category_name:string|null;account_name:string}>;
}
