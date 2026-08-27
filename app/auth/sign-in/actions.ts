'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import type { AuthState } from '@/app/auth/sign-up/actions';

export async function signInWithEmail(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (!email || !password) return { error: 'Informe e-mail e senha.' };
  const { error } = await auth.signIn.email({ email, password });
  if (error) return { error: error.message || 'E-mail ou senha inválidos.' };
  redirect('/dashboard');
}
