import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

export const dynamic='force-dynamic';
export default async function Home(){
  const {data:session}=await auth.getSession(); if(session?.user) redirect('/dashboard');
  return <main className="landing"><nav className="landing-nav"><div className="brand"><span className="brand-mark">C</span><strong>Carteira</strong></div><div><Link href="/auth/sign-in">Entrar</Link><Link className="primary-button compact" href="/auth/sign-up">Criar conta</Link></div></nav>
    <section className="landing-hero"><div><p className="eyebrow">Finanças sem planilha mental</p><h1>Entenda seu dinheiro em poucos segundos.</h1><p>Contas, receitas, despesas e carteiras compartilhadas em uma experiência feita primeiro para o celular.</p><div className="landing-actions"><Link className="primary-button" href="/auth/sign-up">Começar agora</Link><Link className="secondary-button" href="/auth/sign-in">Já tenho conta</Link></div></div>
      <div className="phone-preview" aria-label="Prévia visual da interface"><div className="preview-top"><span>Minha carteira</span><small>Hoje</small></div><div className="preview-balance"><span>Saldo atual</span><strong>R$ —</strong><small>Seus dados aparecem após entrar</small></div><div className="preview-list"><div><span className="preview-dot">↗</span><p><b>Receitas</b><small>Acompanhe entradas reais</small></p></div><div><span className="preview-dot">↙</span><p><b>Despesas</b><small>Entenda para onde vai</small></p></div></div></div>
    </section>
  </main>;
}
