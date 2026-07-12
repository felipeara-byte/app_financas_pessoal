import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFilteredTransactions } from "@/lib/supabase/queries";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const transactions = await getFilteredTransactions(supabase, user.id, {});

  return <TransactionsClient transactions={transactions} />;
}
