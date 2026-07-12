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
