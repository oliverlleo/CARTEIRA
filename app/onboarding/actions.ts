'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/domain/session';
import { createWalletWithFirstAccount } from '@/lib/domain/wallets';
import { onboardingSchema } from '@/lib/validation/finance';

export type OnboardingState = { error?: string } | null;

export async function createFirstWallet(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  const parsed = onboardingSchema.safeParse({
    walletName: formData.get('walletName'), accountName: formData.get('accountName'),
    accountType: formData.get('accountType'), openingBalance: formData.get('openingBalance'),
  });
  if (!parsed.success) return { error: 'Confira os dados da carteira e da conta.' };
  try {
    const created = await createWalletWithFirstAccount({ userId: user.id, ...parsed.data });
    redirect(`/dashboard?wallet=${created.wallet_id}`);
  } catch {
    return { error: 'Não foi possível criar sua carteira agora. Tente novamente.' };
  }
}
