'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';

export type AuthState = { error?: string } | null;

export async function signUpWithEmail(_state: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  if (name.length < 2 || !email || password.length < 8) {
    return { error: 'Confira nome, e-mail e uma senha com pelo menos 8 caracteres.' };
  }
  const { error } = await auth.signUp.email({ name, email, password });
  if (error) return { error: error.message || 'Não foi possível criar sua conta.' };
  redirect('/onboarding');
}
