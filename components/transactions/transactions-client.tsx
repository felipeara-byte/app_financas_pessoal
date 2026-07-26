"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { CategoryRecord, Transaction } from "@/lib/types";
import { deleteTransaction, deleteTransactions } from "@/app/(dashboard)/transactions/actions";
import { TransactionForm } from "./transaction-form";
import { FilterBar, type TransactionFiltersValue } from "./filter-bar";
import { ExportCsvButton } from "./export-csv-button";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function TransactionsClient({
  transactions,
  categories,
  filters,
}: {
  transactions: Transaction[];
  categories: CategoryRecord[];
  filters: TransactionFiltersValue;
}) {
  const categoryNames = Array.from(
    new Set(categories.map((c) => c.name))
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [isPending, startTransition] = useTransition();

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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

  function toggleSelecting() {
    setIsSelecting((prev) => !prev);
    setSelectedIds(new Set());
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds(new Set(transactions.map((t) => t.id)));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function confirmBulkDelete() {
    const ids = Array.from(selectedIds);
    setBulkDeleteOpen(false);
    startTransition(async () => {
      await deleteTransactions(ids);
      toast.success(
        ids.length === 1
          ? "1 transação excluída."
          : `${ids.length} transações excluídas.`
      );
      setIsSelecting(false);
      setSelectedIds(new Set());
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/transactions/import">Importar extrato</Link>}
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/transactions/duplicates">Verificar duplicatas</Link>}
          />
          <ExportCsvButton transactions={transactions} />
          <Button variant="outline" onClick={toggleSelecting}>
            {isSelecting ? "Cancelar seleção" : "Excluir transações"}
          </Button>
          <Button onClick={openCreateDialog}>Nova transação</Button>
        </div>
      </div>

      <FilterBar filters={filters} categoryNames={categoryNames} />

      {isSelecting && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} de {transactions.length} selecionadas
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAllVisible}>
                Selecionar todas
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Nenhuma
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedIds.size === 0 || isPending}
                onClick={() => setBulkDeleteOpen(true)}
              >
                Excluir selecionadas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
            categories={categories}
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "transação" : "transações"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={confirmBulkDelete}
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
                  {isSelecting && <TableHead className="w-8"></TableHead>}
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
                    {isSelecting && (
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(transaction.id)}
                          onCheckedChange={(checked) =>
                            toggleSelected(transaction.id, checked)
                          }
                        />
                      </TableCell>
                    )}
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
                          : "text-destructive"
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
