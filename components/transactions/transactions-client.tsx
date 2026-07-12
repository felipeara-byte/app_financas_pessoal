"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants/categories";
import type { Transaction } from "@/lib/types";
import { deleteTransaction } from "@/app/(dashboard)/transactions/actions";
import { TransactionForm } from "./transaction-form";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function TransactionsClient({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("Excluir esta transação?")) return;
    startTransition(() => {
      deleteTransaction(id);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editing ? "Editar transação" : "Nova transação"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm
            transaction={editing}
            onDone={() => setEditing(null)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma transação cadastrada ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Data</th>
                    <th className="py-2 pr-4 font-medium">Descrição</th>
                    <th className="py-2 pr-4 font-medium">Categoria</th>
                    <th className="py-2 pr-4 font-medium">Tipo</th>
                    <th className="py-2 pr-4 text-right font-medium">Valor</th>
                    <th className="py-2 pr-0 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {dateFormatter.format(
                          new Date(`${transaction.transaction_date}T00:00:00Z`)
                        )}
                      </td>
                      <td className="py-2 pr-4">{transaction.description}</td>
                      <td className="py-2 pr-4">{transaction.category}</td>
                      <td className="py-2 pr-4">
                        {TRANSACTION_TYPE_LABELS[transaction.type]}
                      </td>
                      <td
                        className={`py-2 pr-4 text-right whitespace-nowrap ${
                          transaction.type === "income"
                            ? "text-success"
                            : "text-foreground"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {currencyFormatter.format(transaction.amount)}
                      </td>
                      <td className="py-2 pr-0 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(transaction)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleDelete(transaction.id)}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
