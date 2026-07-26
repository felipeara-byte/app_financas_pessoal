import { z } from "zod";
import { TRANSACTION_TYPES } from "@/lib/constants/categories";

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
  // Categories are user-defined, so this is a free-form (but bounded) string
  // rather than a fixed enum.
  category: z
    .string()
    .trim()
    .min(1, "Selecione uma categoria.")
    .max(40, "A categoria pode ter no máximo 40 caracteres."),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
