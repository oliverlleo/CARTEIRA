import Link from 'next/link';
import { signOut } from '@/app/actions';

type Wallet = { id:string; name:string; role:string };
export function AppShell({ wallets, currentWalletId, children }: { wallets:Wallet[]; currentWalletId:string; children:React.ReactNode }) {
  return <div className="app-shell">
    <aside className="desktop-sidebar">
      <Link href={`/dashboard?wallet=${currentWalletId}`} className="brand"><span className="brand-mark">C</span><strong>Carteira</strong></Link>
      <nav className="side-nav">
        <Link href={`/dashboard?wallet=${currentWalletId}`}>Visão geral</Link>
        <Link href={`/transactions?wallet=${currentWalletId}`}>Lançamentos</Link>
        <span className="nav-disabled" aria-disabled="true">Planejamento</span>
      </nav>
      <form action={signOut}><button className="text-button">Sair</button></form>
    </aside>
    <div className="app-main">
      <header className="mobile-header">
        <Link href={`/dashboard?wallet=${currentWalletId}`} className="brand"><span className="brand-mark">C</span><strong>Carteira</strong></Link>
        <form action={signOut}><button className="text-button">Sair</button></form>
      </header>
      <div className="wallet-switcher" role="navigation" aria-label="Carteiras">
        {wallets.map(w => <Link className={w.id===currentWalletId ? 'wallet-chip active' : 'wallet-chip'} key={w.id} href={`/dashboard?wallet=${w.id}`}>{w.name}</Link>)}
      </div>
      {children}
    </div>
    <nav className="bottom-nav" aria-label="Navegação principal">
      <Link href={`/dashboard?wallet=${currentWalletId}`}><span>⌂</span>Início</Link>
      <Link href={`/transactions?wallet=${currentWalletId}`}><span>≡</span>Lançamentos</Link>
      <Link href={`/transactions?wallet=${currentWalletId}#novo`} className="add-nav" aria-label="Novo lançamento">+</Link>
      <span className="nav-disabled"><span>◫</span>Planejamento</span>
      <span className="nav-disabled"><span>•••</span>Mais</span>
    </nav>
  </div>;
}
