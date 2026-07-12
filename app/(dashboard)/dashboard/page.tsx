import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/supabase/queries";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PeriodFilterBar } from "@/components/dashboard/period-filter-bar";
import {
  CategoryPieChart,
  type CategoryBreakdownItem,
} from "@/components/dashboard/category-pie-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/constants/categories";
import { ALL_MONTHS_VALUE } from "@/lib/constants/filters";

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

interface DashboardPageProps {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const now = new Date();

  const monthParam = params.month ?? String(now.getMonth() + 1);
  const yearParam = params.year ?? String(now.getFullYear());
  const isAllPeriods = monthParam === ALL_MONTHS_VALUE;
  const month = isAllPeriods ? undefined : Number(monthParam);
  const year = isAllPeriods ? undefined : Number(yearParam);

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

  let periodLabel = "Todos os períodos";
  if (!isAllPeriods) {
    const rawMonthLabel = MONTH_YEAR_FORMATTER.format(
      new Date(Date.UTC(Number(yearParam), Number(monthParam) - 1, 1))
    );
    periodLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">{periodLabel}</p>
      </div>

      <PeriodFilterBar filters={{ month: monthParam, year: yearParam }} />

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
