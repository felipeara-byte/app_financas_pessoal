import type { Transaction } from "@/lib/types";

export interface DuplicateGroup {
  key: string;
  transactions: Transaction[];
}

/** Groups transactions that share the exact same date, amount and type --
 * e.g. from accidentally confirming the same statement import twice.
 * Description is deliberately excluded: the same real-world transaction can
 * end up with slightly different wording (manual edits, different import
 * sources), while date + amount + type is what actually identifies "the
 * same money movement". Groups with a single transaction (no duplicate) are
 * omitted. */
export function findDuplicateGroups(transactions: Transaction[]): DuplicateGroup[] {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = `${t.transaction_date}|${t.amount}|${t.type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  return Array.from(groups.entries())
    .filter(([, group]) => group.length > 1)
    .map(([key, group]) => ({ key, transactions: group }))
    .sort((a, b) => b.transactions.length - a.transactions.length);
}
