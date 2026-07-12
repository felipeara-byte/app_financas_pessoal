import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category } from "@/lib/constants/categories";
import type { Transaction } from "@/lib/types";

export interface TransactionFilters {
  month?: number;
  year?: number;
  /** Inclusive range filter (YYYY-MM-DD). Takes precedence over month/year. */
  dateFrom?: string;
  dateTo?: string;
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

  if (filters.dateFrom || filters.dateTo) {
    if (filters.dateFrom) query = query.gte("transaction_date", filters.dateFrom);
    if (filters.dateTo) query = query.lte("transaction_date", filters.dateTo);
  } else if (filters.month && filters.year) {
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

/** Earliest and latest transaction_date years for this user, or null if
 * they have no transactions yet. Used to scope year-picker options to
 * years that actually have data instead of an arbitrary fixed range. */
export async function getTransactionYearRange(
  supabase: SupabaseClient,
  userId: string
): Promise<{ minYear: number; maxYear: number } | null> {
  const [earliest, latest] = await Promise.all([
    supabase
      .from("transactions")
      .select("transaction_date")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: true })
      .limit(1),
    supabase
      .from("transactions")
      .select("transaction_date")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .limit(1),
  ]);

  if (earliest.error) throw earliest.error;
  if (latest.error) throw latest.error;

  if (!earliest.data?.length || !latest.data?.length) {
    return null;
  }

  return {
    minYear: Number(earliest.data[0].transaction_date.slice(0, 4)),
    maxYear: Number(latest.data[0].transaction_date.slice(0, 4)),
  };
}
