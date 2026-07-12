import { z } from "zod";
import { CATEGORIES, TRANSACTION_TYPES } from "@/lib/constants/categories";

export const transactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição.")
    .max(200, "A descrição pode ter no máximo 200 caracteres."),
  amount: z.coerce
    .number({ message: "Informe um valor numérico." })
    .positive("O valor deve ser maior que zero."),
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  type: z.enum(TRANSACTION_TYPES, { message: "Selecione o tipo." }),
  category: z.enum(CATEGORIES, { message: "Selecione uma categoria." }),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
