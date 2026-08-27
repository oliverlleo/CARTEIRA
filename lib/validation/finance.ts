import { z } from 'zod';

const moneyInput = z.string().trim().regex(/^\d{1,12}([,.]\d{1,2})?$/, 'Informe um valor válido.');

export const onboardingSchema = z.object({
  walletName: z.string().trim().min(2).max(80),
  accountName: z.string().trim().min(2).max(100),
  accountType: z.enum(['checking','digital','savings','cash','wallet','business','investment','other']),
  openingBalance: moneyInput,
});

export const transactionSchema = z.object({
  walletId: z.uuid(),
  accountId: z.uuid(),
  categoryId: z.union([z.uuid(), z.literal('')]).optional(),
  kind: z.enum(['income','expense']),
  amount: moneyInput,
  description: z.string().trim().min(1).max(240),
  occurredOn: z.iso.date(),
  notes: z.string().trim().max(2000).optional(),
});

export function moneyToDecimal(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const [whole, decimals = ''] = normalized.split('.');
  return `${whole}.${decimals.padEnd(2, '0').slice(0, 2)}`;
}
