import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_CATEGORIES } from "@/lib/constants/categories";
import type { CategoryRecord } from "@/lib/types";

/**
 * Returns the user's categories, seeding the defaults the first time a user
 * has none. This covers both brand-new signups and users created before the
 * categories feature existed, without relying on a DB trigger or backfill.
 */
export async function getCategories(
  supabase: SupabaseClient,
  userId: string
): Promise<CategoryRecord[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  if (data && data.length > 0) {
    return data as CategoryRecord[];
  }

  // No categories yet: seed the defaults. Ignore conflicts in case a
  // concurrent request already seeded them, then re-read.
  const seed = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: userId }));
  const { error: seedError } = await supabase
    .from("categories")
    .upsert(seed, { onConflict: "user_id,type,name", ignoreDuplicates: true });

  if (seedError) throw seedError;

  const { data: seeded, error: reReadError } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (reReadError) throw reReadError;

  return (seeded ?? []) as CategoryRecord[];
}

/** Splits categories into income/expense lists, preserving order. */
export function splitByType(categories: CategoryRecord[]): {
  income: CategoryRecord[];
  expense: CategoryRecord[];
} {
  return {
    income: categories.filter((c) => c.type === "income"),
    expense: categories.filter((c) => c.type === "expense"),
  };
}
