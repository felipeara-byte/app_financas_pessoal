"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validations/transaction";

export type TransactionActionState = { error: string | null };

function parseFormData(formData: FormData) {
  const parsed = transactionSchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    transaction_date: formData.get("transaction_date"),
    type: formData.get("type"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { data: null, error: firstIssue?.message ?? "Dados inválidos." };
  }

  return { data: parsed.data, error: null };
}

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const { data, error } = parseFormData(formData);
  if (!data) {
    return { error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { error: insertError } = await supabase
    .from("transactions")
    .insert({ ...data, user_id: user.id });

  if (insertError) {
    return { error: "Não foi possível salvar a transação." };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const { data, error } = parseFormData(formData);
  if (!data) {
    return { error };
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("transactions")
    .update(data)
    .eq("id", id);

  if (updateError) {
    return { error: "Não foi possível atualizar a transação." };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}
