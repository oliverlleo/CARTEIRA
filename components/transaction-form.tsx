'use client';
import { useActionState, useEffect, useMemo, useState } from 'react';
import { createTransaction } from '@/app/transactions/actions';

type Account={id:string;name:string}; type Category={id:string;name:string;applies_to:string};
export function TransactionForm({ walletId, accounts, categories }: { walletId:string; accounts:Account[]; categories:Category[] }) {
  const [state, action, pending] = useActionState(createTransaction, null);
  const [kind,setKind] = useState<'expense'|'income'>('expense');
  const filtered = useMemo(() => categories.filter(c => c.applies_to==='both' || c.applies_to===kind), [categories,kind]);
  const today = new Date().toISOString().slice(0,10);
  useEffect(() => { if (state?.success) document.getElementById('amount')?.focus(); }, [state]);
  return <form action={action} className="transaction-form">
    <input type="hidden" name="walletId" value={walletId}/>
    <div className="segmented" role="group" aria-label="Tipo de lançamento"><button type="button" onClick={()=>setKind('expense')} className={kind==='expense'?'active':''}>Despesa</button><button type="button" onClick={()=>setKind('income')} className={kind==='income'?'active':''}>Receita</button></div>
    <input type="hidden" name="kind" value={kind}/>
    <label className="money-label">Valor<input id="amount" name="amount" inputMode="decimal" placeholder="0,00" required autoFocus /></label>
    <label>Descrição<input name="description" placeholder={kind==='expense'?'Ex.: Mercado':'Ex.: Salário'} maxLength={240} required /></label>
    <div className="form-grid"><label>Categoria<select name="categoryId" defaultValue=""><option value="">Sem categoria</option>{filtered.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Conta<select name="accountId" required defaultValue={accounts[0]?.id}>{accounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label></div>
    <label>Data<input type="date" name="occurredOn" defaultValue={today} required /></label>
    <details><summary>Mais opções</summary><label>Notas<textarea name="notes" rows={3} maxLength={2000} placeholder="Opcional" /></label></details>
    {state?.error && <p className="form-error" role="alert">{state.error}</p>}{state?.success && <p className="form-success" role="status">{state.success}</p>}
    <button className="primary-button" disabled={pending || !accounts.length}>{pending?'Salvando…':'Salvar lançamento'}</button>
  </form>;
}
