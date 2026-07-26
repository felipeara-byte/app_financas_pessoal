// Categories are now stored per user in the `categories` table (see
// supabase/migrations/0002_categories.sql). The values below are only the
// defaults seeded for a brand-new user; a category is just a free-form string
// at the type level from here on.

export type Category = string;

export const TRANSACTION_TYPES = ["income", "expense"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};

export interface DefaultCategory {
  name: string;
  type: TransactionType;
  color: string;
}

// Seeded once per user. Colors match the original fixed palette so existing
// charts keep the same look; new user-created categories get an auto-assigned
// color (see lib/constants/category-colors.ts).
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Alimentação", type: "expense", color: "var(--chart-1)" },
  { name: "Transporte", type: "expense", color: "var(--chart-2)" },
  { name: "Moradia", type: "expense", color: "var(--chart-3)" },
  { name: "Lazer", type: "expense", color: "var(--chart-4)" },
  { name: "Saúde", type: "expense", color: "var(--chart-5)" },
  { name: "Educação", type: "expense", color: "var(--chart-6)" },
  { name: "Outros", type: "expense", color: "var(--chart-7)" },
  { name: "Salário", type: "income", color: "var(--chart-8)" },
  { name: "Freelance", type: "income", color: "var(--chart-1)" },
  { name: "Outros", type: "income", color: "var(--chart-7)" },
];

// The category every transaction falls back to when its category is deleted.
// Seeded for both types above, so it always exists.
export const FALLBACK_CATEGORY_NAME = "Outros";
