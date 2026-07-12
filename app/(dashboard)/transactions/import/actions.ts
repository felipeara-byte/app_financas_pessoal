"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validations/transaction";
import { extractPdfText } from "@/lib/import/pdf-text";
import { parseSantanderStatement, type ParsedRow } from "@/lib/import/santander-parser";

export interface ImportRow extends ParsedRow {
  id: string;
  sourceFile: string;
}

export interface ParseStatementResult {
  rows: ImportRow[];
  errors: string[];
}

export async function parseStatementFiles(
  formData: FormData
): Promise<ParseStatementResult> {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  const rows: ImportRow[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const text = await extractPdfText(buffer);
      const parsed = parseSantanderStatement(text);

      if (parsed.length === 0) {
        errors.push(`${file.name}: nenhuma transação encontrada.`);
        continue;
      }

      for (const row of parsed) {
        rows.push({ ...row, id: randomUUID(), sourceFile: file.name });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido.";
      errors.push(`${file.name}: ${message}`);
    }
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));

  return { rows, errors };
}

export interface ImportTransactionsState {
  error: string | null;
  imported: number;
}

export async function importTransactions(
  rows: ImportRow[]
): Promise<ImportTransactionsState> {
  if (rows.length === 0) {
    return { error: "Nenhuma transação selecionada.", imported: 0 };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente.", imported: 0 };
  }

  const toInsert = [];
  for (const row of rows) {
    const parsed = transactionSchema.safeParse({
      description: row.description,
      amount: row.amount,
      transaction_date: row.date,
      type: row.type,
      category: row.category,
    });
    if (!parsed.success) {
      return {
        error: `Transação inválida ("${row.description}"): ${parsed.error.issues[0]?.message}`,
        imported: 0,
      };
    }
    toInsert.push({ ...parsed.data, user_id: user.id });
  }

  const { error } = await supabase.from("transactions").insert(toInsert);

  if (error) {
    return { error: "Não foi possível importar as transações.", imported: 0 };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  return { error: null, imported: toInsert.length };
}
