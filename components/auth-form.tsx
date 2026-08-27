'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import type { AuthState } from '@/app/auth/sign-up/actions';

type Props = {
  mode: 'sign-in' | 'sign-up';
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const signup = mode === 'sign-up';
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand" href="/" aria-label="Carteira — início"><span className="brand-mark">C</span><strong>Carteira</strong></Link>
        <div className="auth-heading">
          <p className="eyebrow">{signup ? 'Comece com o essencial' : 'Bem-vindo de volta'}</p>
          <h1>{signup ? 'Crie sua conta' : 'Entre na sua conta'}</h1>
          <p>{signup ? 'Sua vida financeira organizada em carteiras privadas ou compartilhadas.' : 'Acesse suas carteiras e continue de onde parou.'}</p>
        </div>
        <form action={formAction} className="form-stack">
          {signup && <label>Nome<input name="name" autoComplete="name" required minLength={2} /></label>}
          <label>E-mail<input name="email" type="email" autoComplete="email" inputMode="email" required /></label>
          <label>Senha<input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={8} required /></label>
          {state?.error && <p className="form-error" role="alert">{state.error}</p>}
          <button className="primary-button" type="submit" disabled={pending}>{pending ? 'Aguarde…' : signup ? 'Criar conta' : 'Entrar'}</button>
        </form>
        <p className="auth-switch">{signup ? 'Já tem uma conta?' : 'Ainda não tem conta?'} <Link href={signup ? '/auth/sign-in' : '/auth/sign-up'}>{signup ? 'Entrar' : 'Criar conta'}</Link></p>
      </section>
    </main>
  );
}
