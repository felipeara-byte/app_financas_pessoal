export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
  "Outros",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ITEMS: Record<Category, string> = Object.fromEntries(
  CATEGORIES.map((category) => [category, category])
) as Record<Category, string>;

export const TRANSACTION_TYPES = ["income", "expense"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Receita",
  expense: "Despesa",
};
