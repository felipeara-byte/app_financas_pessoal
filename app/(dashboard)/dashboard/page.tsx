import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/supabase/queries";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import {
  CategoryPieChart,
  type CategoryBreakdownItem,
} from "@/components/dashboard/category-pie-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/constants/categories";

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const transactions = await getFilteredTransactions(supabase, user.id, {
    month,
    year,
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseByCategory = new Map<Category, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    expenseByCategory.set(
      t.category,
      (expenseByCategory.get(t.category) ?? 0) + t.amount
    );
  }
  const categoryBreakdown: CategoryBreakdownItem[] = Array.from(
    expenseByCategory,
    ([category, total]) => ({ category, total })
  ).sort((a, b) => b.total - a.total);

  const monthLabel = MONTH_YEAR_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground capitalize">{monthLabel}</p>
      </div>

      <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

      <Card>
        <CardHeader>
          <CardTitle>Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryPieChart data={categoryBreakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
