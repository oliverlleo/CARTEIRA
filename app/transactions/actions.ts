'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/domain/session';
import { createManualTransaction } from '@/lib/domain/finance';
import { transactionSchema } from '@/lib/validation/finance';

export type TransactionState = { error?:string; success?:string } | null;
export async function createTransaction(_state:TransactionState, formData:FormData): Promise<TransactionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse({
    walletId: formData.get('walletId'), accountId: formData.get('accountId'), categoryId: formData.get('categoryId'),
    kind: formData.get('kind'), amount: formData.get('amount'), description: formData.get('description'), occurredOn: formData.get('occurredOn'), notes: formData.get('notes'),
  });
  if (!parsed.success) return { error:'Confira valor, descrição, conta, categoria e data.' };
  try {
    await createManualTransaction({ ...parsed.data, categoryId: parsed.data.categoryId || undefined, userId:user.id });
    revalidatePath('/dashboard'); revalidatePath('/transactions');
    return { success:'Lançamento salvo.' };
  } catch (error) {
    console.error('createTransaction failed', error);
    return { error:'Não foi possível salvar. Seus dados não foram alterados.' };
  }
}
