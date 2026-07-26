import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/supabase/queries";
import { getCategories } from "@/lib/supabase/categories";
import { TransactionsClient } from "@/components/transactions/transactions-client";
import { ALL_CATEGORIES_VALUE, ALL_MONTHS_VALUE } from "@/lib/constants/filters";

interface TransactionsPageProps {
  searchParams: Promise<{
    month?: string;
    year?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const now = new Date();

  const monthParam = params.month ?? ALL_MONTHS_VALUE;
  const yearParam = params.year ?? String(now.getFullYear());
  const categoryParam = params.category ?? ALL_CATEGORIES_VALUE;
  const searchParam = params.search ?? "";

  const isAllMonths = monthParam === ALL_MONTHS_VALUE;

  const [transactions, categories] = await Promise.all([
    getFilteredTransactions(supabase, user.id, {
      month: isAllMonths ? undefined : Number(monthParam),
      year: isAllMonths ? undefined : Number(yearParam),
      category:
        categoryParam === ALL_CATEGORIES_VALUE ? undefined : categoryParam,
      search: searchParam || undefined,
    }),
    getCategories(supabase, user.id),
  ]);

  return (
    <TransactionsClient
      transactions={transactions}
      categories={categories}
      filters={{
        month: monthParam,
        year: yearParam,
        category: categoryParam,
        search: searchParam,
      }}
    />
  );
}
