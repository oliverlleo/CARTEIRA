import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { TransactionForm } from '@/components/transaction-form';
import { requireUser } from '@/lib/domain/session';
import { listWallets } from '@/lib/domain/wallets';
import { getTransactionFormData, listTransactions } from '@/lib/domain/finance';
import { brl, brDate } from '@/lib/format';

export const dynamic='force-dynamic';
export default async function TransactionsPage({searchParams}:{searchParams:Promise<{wallet?:string}>}) {
  const user=await requireUser(); const wallets=await listWallets(user.id); if(!wallets.length) redirect('/onboarding');
  const requested=(await searchParams).wallet; const current=wallets.find(w=>w.id===requested)??wallets[0];
  const [formData, transactions]=await Promise.all([getTransactionFormData(current.id,user.id),listTransactions(current.id,user.id)]);
  return <AppShell wallets={wallets} currentWalletId={current.id}><main className="content-page"><section className="page-heading"><div><p className="eyebrow">{current.name}</p><h1>Lançamentos</h1><p>Receitas e despesas da carteira, agrupadas em uma linha do tempo simples.</p></div></section>
    <section id="novo" className="panel quick-add-panel"><div className="section-title"><div><p className="eyebrow">Quick add</p><h2>Novo lançamento</h2></div></div>{formData.accounts.length?<TransactionForm walletId={current.id} accounts={formData.accounts} categories={formData.categories}/>:<div className="empty-state"><strong>Crie uma conta primeiro</strong><p>Todo lançamento precisa pertencer a uma conta da carteira.</p></div>}</section>
    <section className="section-block"><div className="section-title"><div><p className="eyebrow">Histórico</p><h2>Movimentações</h2></div></div>{transactions.length?<div className="transaction-list">{transactions.map(t=><article className="transaction-row" key={t.id}><div className="transaction-symbol">{t.direction==='credit'?'↗':'↙'}</div><div className="transaction-copy"><strong>{t.description}</strong><span>{t.category_name??'Sem categoria'} · {t.account_name} · {brDate(t.occurred_on)}</span></div><b className={t.direction==='credit'?'positive':'negative'}>{t.direction==='credit'?'+':'−'} {brl(t.amount)}</b></article>)}</div>:<div className="empty-state"><strong>Nenhum lançamento ainda</strong><p>Use o formulário acima para registrar sua primeira movimentação.</p></div>}</section>
  </main></AppShell>;
}
