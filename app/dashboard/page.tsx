import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { requireUser } from '@/lib/domain/session';
import { listWallets } from '@/lib/domain/wallets';
import { getDashboard } from '@/lib/domain/finance';
import { brl, brDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{wallet?:string}> }) {
  const user = await requireUser();
  const wallets = await listWallets(user.id);
  if (!wallets.length) redirect('/onboarding');
  const requested = (await searchParams).wallet;
  const current = wallets.find(w => w.id === requested) ?? wallets[0];
  const data = await getDashboard(current.id, user.id);
  const s = data.summary ?? { current_balance:'0', projected_balance:'0', month_income:'0', month_expense:'0' };
  return <AppShell wallets={wallets} currentWalletId={current.id}>
    <main className="content-page">
      <section className="page-heading"><div><p className="eyebrow">{current.name}</p><h1>Seu dinheiro, sem complicação</h1><p>Veja o que você tem agora e como o mês está andando.</p></div><Link className="primary-button compact" href={`/transactions?wallet=${current.id}#novo`}>+ Lançamento</Link></section>
      <section className="hero-balance">
        <p>Saldo atual</p><strong>{brl(s.current_balance)}</strong>
        <div><span>Previsto</span><b>{brl(s.projected_balance)}</b></div>
      </section>
      <section className="metric-grid">
        <article className="metric-card"><span>Entradas do mês</span><strong className="positive">{brl(s.month_income)}</strong></article>
        <article className="metric-card"><span>Saídas do mês</span><strong className="negative">{brl(s.month_expense)}</strong></article>
      </section>
      <section className="section-block"><div className="section-title"><div><p className="eyebrow">Contas</p><h2>Onde seu dinheiro está</h2></div></div>
        {data.accounts.length ? <div className="account-list">{data.accounts.map(a => <article className="account-card" key={a.id}><div><span className="account-icon">●</span><div><strong>{a.name}</strong><small>{a.account_type}</small></div></div><b>{a.hide_balance ? '••••••' : brl(a.current_balance)}</b></article>)}</div> : <div className="empty-state"><strong>Nenhuma conta cadastrada</strong><p>Adicione uma conta para começar a acompanhar seus saldos.</p></div>}
      </section>
      <section className="section-block"><div className="section-title"><div><p className="eyebrow">Recentes</p><h2>Últimos lançamentos</h2></div><Link href={`/transactions?wallet=${current.id}`}>Ver todos</Link></div>
        {data.recent.length ? <div className="transaction-list">{data.recent.map(t => <article className="transaction-row" key={t.id}><div className="transaction-symbol">{t.direction==='credit'?'↗':'↙'}</div><div className="transaction-copy"><strong>{t.description}</strong><span>{t.category_name ?? 'Sem categoria'} · {t.account_name} · {brDate(t.occurred_on)}</span></div><b className={t.direction==='credit'?'positive':'negative'}>{t.direction==='credit'?'+':'−'} {brl(t.amount)}</b></article>)}</div> : <div className="empty-state"><strong>Você ainda não tem lançamentos</strong><p>Adicione sua primeira receita ou despesa. Ela aparecerá aqui imediatamente.</p><Link className="secondary-button" href={`/transactions?wallet=${current.id}#novo`}>Adicionar lançamento</Link></div>}
      </section>
    </main>
  </AppShell>;
}
