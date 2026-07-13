"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";
import type { DuplicateGroup } from "@/lib/transactions/duplicates";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function DuplicatesClient({ groups }: { groups: DuplicateGroup[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTransaction(id);
      toast.success("Transação excluída.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/transactions"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Voltar para Transações
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Verificar duplicatas
        </h1>
        <p className="text-sm text-muted-foreground">
          Transações com a mesma data, valor e tipo (receita ou despesa) —
          útil para detectar uma importação confirmada duas vezes por engano,
          mesmo que a descrição esteja escrita de forma um pouco diferente.
          Mantenha uma de cada grupo e exclua as demais.
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma duplicata encontrada.
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <CardTitle className="text-base">
                {group.transactions.length} lançamentos idênticos
              </CardTitle>
              <CardDescription>
                {dateFormatter.format(
                  new Date(`${group.transactions[0].transaction_date}T00:00:00Z`)
                )}{" "}
                —{" "}
                {currencyFormatter.format(group.transactions[0].amount)}{" "}
                (
                {group.transactions[0].type === "income" ? "receita" : "despesa"}
                )
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {group.transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium text-foreground">
                        {t.description}
                      </span>
                      <Badge variant="secondary" className="shrink-0">
                        {t.category}
                      </Badge>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        criado em{" "}
                        {new Date(t.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleDelete(t.id)}
                    >
                      Excluir
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
