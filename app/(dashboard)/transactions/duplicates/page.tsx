import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/supabase/queries";
import { findDuplicateGroups } from "@/lib/transactions/duplicates";
import { DuplicatesClient } from "@/components/transactions/duplicates-client";

export default async function DuplicatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getFilteredTransactions(supabase, user.id, {});
  const groups = findDuplicateGroups(transactions);

  return <DuplicatesClient groups={groups} />;
}
