import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/constants/categories";
import type { Transaction } from "@/lib/types";

export interface TransactionFilters {
  month?: number;
  year?: number;
  category?: Category;
  search?: string;
}

function monthRange(month: number, year: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const end = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return { start, end };
}

export async function getFilteredTransactions(
  supabase: SupabaseClient,
  userId: string,
  filters: TransactionFilters
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.month && filters.year) {
    const { start, end } = monthRange(filters.month, filters.year);
    query = query.gte("transaction_date", start).lt("transaction_date", end);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    query = query.ilike("description", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}
