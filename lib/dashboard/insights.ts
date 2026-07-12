import type { Transaction } from "@/lib/types";

export interface MonthYear {
  month: number;
  year: number;
}

function shiftMonth({ month, year }: MonthYear, delta: number): MonthYear {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (((total % 12) + 12) % 12) + 1 };
}

/** The immediately preceding period of the same length (in months). */
export function getPreviousPeriod(
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number
): { fromMonth: number; fromYear: number; toMonth: number; toYear: number } {
  const monthsCount = (toYear * 12 + toMonth) - (fromYear * 12 + fromMonth) + 1;
  const prevTo = shiftMonth({ month: fromMonth, year: fromYear }, -1);
  const prevFrom = shiftMonth(prevTo, -(monthsCount - 1));
  return {
    fromMonth: prevFrom.month,
    fromYear: prevFrom.year,
    toMonth: prevTo.month,
    toYear: prevTo.year,
  };
}

/** Percent change from `previous` to `current`. Null means "no baseline to
 * compare against" (previous was zero) -- render as "novo" rather than a
 * misleading +Infinity%. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function normalizeDescription(description: string): string {
  // Strip numeric tokens (parcel numbers like "012/012", document refs,
  // embedded dates) so the same bill matches across months despite those
  // varying, without collapsing to a prefix so short that two genuinely
  // different payees sharing a generic bank-generated label (e.g. two
  // unrelated "PAGAMENTO DE BOLETO OUTROS BANCOS <company>" entries) would
  // otherwise be treated as the same recurring item.
  return description
    .trim()
    .toUpperCase()
    .replace(/\d+(?:[./]\d+)*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Descriptions (with parcel numbers/dates/doc refs stripped, to tolerate
 * varying detail like "Parc 008/012") that appear as an expense in 2+
 * distinct months across the given transactions -- a pragmatic stand-in for
 * "this is a recurring/fixed bill" without a dedicated field on the
 * transaction. */
export function detectRecurringDescriptions(transactions: Transaction[]): Set<string> {
  const monthsByKey = new Map<string, Set<string>>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const key = normalizeDescription(t.description);
    const monthKey = t.transaction_date.slice(0, 7);
    if (!monthsByKey.has(key)) monthsByKey.set(key, new Set());
    monthsByKey.get(key)!.add(monthKey);
  }
  const recurring = new Set<string>();
  for (const [key, months] of monthsByKey) {
    if (months.size >= 2) recurring.add(key);
  }
  return recurring;
}

export function isRecurringExpense(
  transaction: Transaction,
  recurringDescriptions: Set<string>
): boolean {
  return recurringDescriptions.has(normalizeDescription(transaction.description));
}
