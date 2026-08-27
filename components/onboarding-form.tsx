'use client';
import { useActionState } from 'react';
import { createFirstWallet } from '@/app/onboarding/actions';

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createFirstWallet, null);
  return <form action={action} className="form-stack onboarding-form">
    <label>Nome da carteira<input name="walletName" required minLength={2} placeholder="Ex.: Minha vida financeira" /></label>
    <label>Primeira conta<input name="accountName" required minLength={2} placeholder="Ex.: Nubank" /></label>
    <label>Tipo da conta<select name="accountType" defaultValue="digital"><option value="checking">Conta corrente</option><option value="digital">Conta digital</option><option value="savings">Poupança</option><option value="cash">Dinheiro físico</option><option value="wallet">Carteira digital</option><option value="business">Conta PJ</option><option value="investment">Investimento simples</option><option value="other">Outro</option></select></label>
    <label>Saldo inicial<input name="openingBalance" inputMode="decimal" defaultValue="0,00" required /></label>
    {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="primary-button" disabled={pending}>{pending ? 'Criando…' : 'Criar e continuar'}</button>
  </form>;
}
