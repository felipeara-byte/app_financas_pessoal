import type { Category } from "@/lib/constants/categories";

// Fixed categorical order (never re-sorted by data) mapped to the app's
// validated chart color slots defined in app/globals.css.
export const EXPENSE_CATEGORY_COLORS: Partial<Record<Category, string>> = {
  Alimentação: "var(--chart-1)",
  Transporte: "var(--chart-2)",
  Moradia: "var(--chart-3)",
  Lazer: "var(--chart-4)",
  Saúde: "var(--chart-5)",
  Educação: "var(--chart-6)",
  Outros: "var(--chart-7)",
};

// Income only ever shows a handful of categories (Salário/Freelance/Outros),
// so this reuses the same validated palette from a different subset of
// slots -- it's never rendered in the same legend as the expense chart,
// except "Outros", which is kept on the same slot (chart-7) in both so the
// one category shared between the two charts stays visually consistent.
export const INCOME_CATEGORY_COLORS: Partial<Record<Category, string>> = {
  Salário: "var(--chart-8)",
  Freelance: "var(--chart-1)",
  Outros: "var(--chart-7)",
};
