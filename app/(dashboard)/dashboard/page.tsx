import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions, getTransactionYearRange } from "@/lib/supabase/queries";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PeriodFilterBar } from "@/components/dashboard/period-filter-bar";
import {
  CategoryPieChart,
  type CategoryBreakdownItem,
} from "@/components/dashboard/category-pie-chart";
import { MonthlyBarChart, type MonthlyTotal } from "@/components/dashboard/monthly-bar-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/constants/categories";
import { buildMonthRange, MONTH_OPTIONS } from "@/lib/constants/filters";
import {
  EXPENSE_CATEGORY_COLORS,
  INCOME_CATEGORY_COLORS,
} from "@/lib/constants/category-colors";
import type { Transaction } from "@/lib/types";

interface DashboardPageProps {
  searchParams: Promise<{
    from_month?: string;
    from_year?: string;
    to_month?: string;
    to_year?: string;
  }>;
}

function categoryBreakdown(
  transactions: Transaction[],
  type: "income" | "expense"
): CategoryBreakdownItem[] {
  const totals = new Map<Category, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(totals, ([category, total]) => ({ category, total })).sort(
    (a, b) => b.total - a.total
  );
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
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const fromMonth = Number(params.from_month ?? 1);
  const fromYear = Number(params.from_year ?? currentYear);
  const toMonth = Number(params.to_month ?? currentMonth);
  const toYear = Number(params.to_year ?? currentYear);

  const { dateFrom, dateTo } = buildMonthRange(fromMonth, fromYear, toMonth, toYear);

  const yearRange = await getTransactionYearRange(supabase, user.id);
  const minYear = Math.min(yearRange?.minYear ?? currentYear, currentYear);
  const maxYear = Math.max(yearRange?.maxYear ?? currentYear, currentYear);
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) =>
    String(minYear + i)
  );

  const transactions = await getFilteredTransactions(supabase, user.id, {
    dateFrom,
    dateTo,
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseBreakdown = categoryBreakdown(transactions, "expense");
  const incomeBreakdown = categoryBreakdown(transactions, "income");

  // Month-by-month chart always covers the current calendar year, independent
  // of the period filter above -- it's meant as a stable year-at-a-glance view.
  const yearTransactions = await getFilteredTransactions(supabase, user.id, {
    dateFrom: `${currentYear}-01-01`,
    dateTo: `${currentYear}-12-31`,
  });

  const monthlyTotals: MonthlyTotal[] = MONTH_OPTIONS.map((month) => {
    const monthNumber = Number(month.value);
    const monthTransactions = yearTransactions.filter(
      (t) => Number(t.transaction_date.slice(5, 7)) === monthNumber
    );
    return {
      month: month.label.slice(0, 3),
      income: monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
      expense: monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <PeriodFilterBar
        filters={{
          fromMonth: String(fromMonth),
          fromYear: String(fromYear),
          toMonth: String(toMonth),
          toYear: String(toYear),
        }}
        yearOptions={yearOptions}
      />

      <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={expenseBreakdown}
              colors={EXPENSE_CATEGORY_COLORS}
              emptyMessage="Nenhuma despesa registrada neste período."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receitas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart
              data={incomeBreakdown}
              colors={INCOME_CATEGORY_COLORS}
              emptyMessage="Nenhuma receita registrada neste período."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receitas e despesas por mês — {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyBarChart data={monthlyTotals} />
        </CardContent>
      </Card>
    </div>
  );
}
