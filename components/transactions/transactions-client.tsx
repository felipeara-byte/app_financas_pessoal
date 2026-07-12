"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreateDialog() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditDialog(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);
    startTransition(async () => {
      await deleteTransaction(id);
      toast.success("Transação excluída.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
        <Button onClick={openCreateDialog}>Nova transação</Button>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar transação" : "Nova transação"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados da transação."
                : "Preencha os dados da receita ou despesa."}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            transaction={editing}
            onDone={() => setFormOpen(false)}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  Esta ação não pode ser desfeita. A transação &ldquo;
                  {deleteTarget.description}&rdquo; será excluída
                  permanentemente.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Todas as transações</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma transação cadastrada ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="whitespace-nowrap">
                      {dateFormatter.format(
                        new Date(`${transaction.transaction_date}T00:00:00Z`)
                      )}
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {TRANSACTION_TYPE_LABELS[transaction.type]}
                    </TableCell>
                    <TableCell
                      className={`text-right whitespace-nowrap ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {currencyFormatter.format(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(transaction)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(transaction)}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
