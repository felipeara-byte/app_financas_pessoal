"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/supabase/categories";
import { nextCategoryColor } from "@/lib/constants/category-colors";
import {
  FALLBACK_CATEGORY_NAME,
  TRANSACTION_TYPES,
} from "@/lib/constants/categories";
import type { CategoryRecord } from "@/lib/types";

export type CategoryActionState = { error: string | null };

const nameSchema = z
  .string()
  .trim()
  .min(1, "Informe um nome.")
  .max(40, "O nome pode ter no máximo 40 caracteres.");

const typeSchema = z.enum(TRANSACTION_TYPES, { message: "Tipo inválido." });

function revalidate() {
  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
}

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const name = nameSchema.safeParse(formData.get("name"));
  const type = typeSchema.safeParse(formData.get("type"));

  if (!name.success) return { error: name.error.issues[0]?.message ?? "Nome inválido." };
  if (!type.success) return { error: "Selecione entrada ou saída." };

  const { supabase, user } = await authedClient();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const existing = await getCategories(supabase, user.id);
  const sameType = existing.filter((c) => c.type === type.data);

  if (sameType.some((c) => c.name.toLowerCase() === name.data.toLowerCase())) {
    return { error: `Já existe uma categoria "${name.data}" nesse tipo.` };
  }

  const color = nextCategoryColor(sameType.map((c) => c.color));

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: name.data,
    type: type.data,
    color,
  });

  if (error) return { error: "Não foi possível criar a categoria." };

  revalidate();
  return { error: null };
}

export async function renameCategory(
  id: string,
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0]?.message ?? "Nome inválido." };

  const { supabase, user } = await authedClient();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single<CategoryRecord>();

  if (!category) return { error: "Categoria não encontrada." };

  if (category.name === FALLBACK_CATEGORY_NAME) {
    return { error: `A categoria "${FALLBACK_CATEGORY_NAME}" não pode ser renomeada.` };
  }

  if (name.data === category.name) {
    return { error: null };
  }

  const all = await getCategories(supabase, user.id);
  const clash = all.some(
    (c) =>
      c.type === category.type &&
      c.id !== id &&
      c.name.toLowerCase() === name.data.toLowerCase()
  );
  if (clash) return { error: `Já existe uma categoria "${name.data}" nesse tipo.` };

  const { error: updateError } = await supabase
    .from("categories")
    .update({ name: name.data })
    .eq("id", id);

  if (updateError) return { error: "Não foi possível renomear a categoria." };

  // Keep existing transactions pointing at the new name.
  const { error: txError } = await supabase
    .from("transactions")
    .update({ category: name.data })
    .eq("user_id", user.id)
    .eq("type", category.type)
    .eq("category", category.name);

  if (txError) {
    // Roll the rename back so the category and its transactions stay in sync.
    await supabase.from("categories").update({ name: category.name }).eq("id", id);
    return { error: "Não foi possível atualizar as transações da categoria." };
  }

  revalidate();
  return { error: null };
}

export async function deleteCategory(id: string): Promise<CategoryActionState> {
  const { supabase, user } = await authedClient();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single<CategoryRecord>();

  if (!category) return { error: "Categoria não encontrada." };

  if (category.name === FALLBACK_CATEGORY_NAME) {
    return { error: `A categoria "${FALLBACK_CATEGORY_NAME}" não pode ser excluída.` };
  }

  // Reassign the category's transactions to the fallback before removing it.
  const { error: reassignError } = await supabase
    .from("transactions")
    .update({ category: FALLBACK_CATEGORY_NAME })
    .eq("user_id", user.id)
    .eq("type", category.type)
    .eq("category", category.name);

  if (reassignError) {
    return { error: "Não foi possível reatribuir as transações da categoria." };
  }

  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (deleteError) return { error: "Não foi possível excluir a categoria." };

  revalidate();
  return { error: null };
}
