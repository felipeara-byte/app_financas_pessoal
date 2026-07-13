import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/supabase/queries";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { PeriodFilterBar } from "@/components/dashboard/period-filter-bar";
import {
  CategoryPieChart,
  type CategoryBreakdownItem,
} from "@/components/dashboard/category-pie-chart";
import { MonthlyBarChart, type MonthlyTotal } from "@/components/dashboard/monthly-bar-chart";
import { TopTransactionsCard } from "@/components/dashboard/top-transactions-card";
import { FixedVariableCard } from "@/components/dashboard/fixed-variable-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Category } from "@/lib/constants/categories";
import { ALL_CATEGORIES_VALUE, buildMonthRange, MONTH_OPTIONS } from "@/lib/constants/filters";
import {
  EXPENSE_CATEGORY_COLORS,
  INCOME_CATEGORY_COLORS,
} from "@/lib/constants/category-colors";
import type { Transaction } from "@/lib/types";
import { detectRecurringDescriptions, getPreviousPeriod, isRecurringExpense } from "@/lib/dashboard/insights";

interface DashboardPageProps {
  searchParams: Promise<{
    from_month?: string;
    from_year?: string;
    to_month?: string;
    to_year?: string;
    category?: string;
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

function inRange(transactions: Transaction[], dateFrom: string, dateTo: string): Transaction[] {
  return transactions.filter(
    (t) => t.transaction_date >= dateFrom && t.transaction_date <= dateTo
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
  const categoryParam = params.category ?? ALL_CATEGORIES_VALUE;

  const { dateFrom, dateTo } = buildMonthRange(fromMonth, fromYear, toMonth, toYear);
  const previous = getPreviousPeriod(fromMonth, fromYear, toMonth, toYear);
  const previousRange = buildMonthRange(
    previous.fromMonth,
    previous.fromYear,
    previous.toMonth,
    previous.toYear
  );

  // Personal-finance data volume is small enough to fetch once and derive
  // every view (period, previous period, year chart, recurring detection)
  // in memory instead of round-tripping to the database per computation.
  const fetchedTransactions = await getFilteredTransactions(supabase, user.id, {});

  const years = Array.from(
    new Set(fetchedTransactions.map((t) => t.transaction_date.slice(0, 4)))
  );
  if (!years.includes(String(currentYear))) years.push(String(currentYear));
  const yearOptions = years.sort();

  const allTransactions =
    categoryParam === ALL_CATEGORIES_VALUE
      ? fetchedTransactions
      : fetchedTransactions.filter((t) => t.category === categoryParam);

  const transactions = inRange(allTransactions, dateFrom, dateTo);
  const previousTransactions = inRange(
    allTransactions,
    previousRange.dateFrom,
    previousRange.dateTo
  );
  const yearTransactions = allTransactions.filter((t) =>
    t.transaction_date.startsWith(String(currentYear))
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const previousIncome = previousTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const previousExpense = previousTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseBreakdown = categoryBreakdown(transactions, "expense");
  const incomeBreakdown = categoryBreakdown(transactions, "income");

  const recurringDescriptions = detectRecurringDescriptions(allTransactions);
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const fixedTotal = expenseTransactions
    .filter((t) => isRecurringExpense(t, recurringDescriptions))
    .reduce((sum, t) => sum + t.amount, 0);
  const variableTotal = totalExpense - fixedTotal;

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
          category: categoryParam,
        }}
        yearOptions={yearOptions}
      />

      <SummaryCards
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        previousIncome={previousIncome}
        previousExpense={previousExpense}
      />

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

      <div className="grid gap-4 lg:grid-cols-2">
        <TopTransactionsCard transactions={transactions} />
        <FixedVariableCard fixedTotal={fixedTotal} variableTotal={variableTotal} />
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
