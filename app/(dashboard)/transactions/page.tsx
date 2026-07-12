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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
      <TransactionsClient transactions={transactions} />
    </div>
  );
}
