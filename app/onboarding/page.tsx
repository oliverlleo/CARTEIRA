import { redirect } from 'next/navigation';
import { OnboardingForm } from '@/components/onboarding-form';
import { requireUser } from '@/lib/domain/session';
import { listWallets } from '@/lib/domain/wallets';

export default async function OnboardingPage() {
  const user = await requireUser();
  const wallets = await listWallets(user.id);
  if (wallets.length) redirect(`/dashboard?wallet=${wallets[0].id}`);
  return <main className="center-page"><section className="panel onboarding-panel"><p className="eyebrow">Configuração inicial</p><h1>Vamos montar sua primeira carteira</h1><p>Comece com uma conta e o saldo atual. Você poderá adicionar cartões, salários e outras contas depois.</p><OnboardingForm /></section></main>;
}
