"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
  type TransactionType,
} from "@/lib/constants/categories";
import type { CategoryRecord } from "@/lib/types";
import {
  parseStatementFiles,
  importTransactions,
  type ImportRow,
} from "@/app/(dashboard)/transactions/import/actions";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function ImportClient({ categories }: { categories: CategoryRecord[] }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isParsing, startParsing] = useTransition();
  const [isImporting, startImporting] = useTransition();

  function handleAnalyze() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) {
      toast.error("Selecione ao menos um arquivo PDF.");
      return;
    }

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("files", file);
    }

    startParsing(async () => {
      const result = await parseStatementFiles(formData);
      setRows(result.rows);
      setErrors(result.errors);
      if (result.rows.length === 0 && result.errors.length === 0) {
        toast.error("Nenhuma transação encontrada nos arquivos.");
      } else if (result.rows.length > 0) {
        toast.success(`${result.rows.length} transações encontradas.`);
      }
    });
  }

  function updateRow(id: string, patch: Partial<ImportRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function setAllSelected(selected: boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, selected })));
  }

  function handleImport() {
    const selectedRows = rows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      toast.error("Selecione ao menos uma transação para importar.");
      return;
    }

    startImporting(async () => {
      const result = await importTransactions(selectedRows);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`${result.imported} transações importadas.`);
      router.push("/transactions");
    });
  }

  const selectedCount = rows.filter((r) => r.selected).length;
  const selectedIncome = rows
    .filter((r) => r.selected && r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);
  const selectedExpense = rows
    .filter((r) => r.selected && r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

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
          Importar extrato bancário
        </h1>
        <p className="text-sm text-muted-foreground">
          Envie um ou mais extratos e/ou faturas de cartão em PDF do Santander,
          ou faturas do cartão Nubank. As transações são extraídas
          automaticamente — revise e ajuste antes de confirmar. Ao importar uma
          fatura, cada compra do cartão entra detalhada por categoria; por isso a
          linha de pagamento do cartão no extrato da conta já vem desmarcada,
          para não contar em dobro.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Selecionar arquivos</CardTitle>
          <CardDescription>
            Formatos aceitos: extrato ou fatura do cartão Santander, e fatura do
            cartão Nubank (PDF).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="flex-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          <Button onClick={handleAnalyze} disabled={isParsing}>
            {isParsing ? "Analisando..." : "Analisar extrato(s)"}
          </Button>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">
              Alguns arquivos não puderam ser lidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>2. Revisar transações</CardTitle>
                <CardDescription>
                  {selectedCount} de {rows.length} selecionadas — receitas{" "}
                  {currencyFormatter.format(selectedIncome)}, despesas{" "}
                  {currencyFormatter.format(selectedExpense)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setAllSelected(true)}>
                  Selecionar todos
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAllSelected(false)}>
                  Nenhum
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const rowCategories = categories.filter(
                    (c) => c.type === row.type
                  );
                  const categoryItems = Object.fromEntries(
                    rowCategories.map((c) => [c.name, c.name])
                  );
                  return (
                  <TableRow key={row.id} className={row.selected ? "" : "opacity-50"}>
                    <TableCell>
                      <Checkbox
                        checked={row.selected}
                        onCheckedChange={(checked) =>
                          updateRow(row.id, { selected: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, { date: e.target.value })}
                        className="w-36"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          updateRow(row.id, { description: e.target.value })
                        }
                        className="min-w-56"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        items={categoryItems}
                        value={row.category}
                        onValueChange={(value) =>
                          updateRow(row.id, { category: value as string })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {rowCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        items={TRANSACTION_TYPE_LABELS}
                        value={row.type}
                        onValueChange={(value) => {
                          const nextType = value as TransactionType;
                          const stillValid = categories.some(
                            (c) =>
                              c.type === nextType && c.name === row.category
                          );
                          updateRow(row.id, {
                            type: nextType,
                            ...(stillValid
                              ? {}
                              : {
                                  category:
                                    categories.find((c) => c.type === nextType)
                                      ?.name ?? row.category,
                                }),
                          });
                        }}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRANSACTION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {TRANSACTION_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={row.amount}
                        onChange={(e) =>
                          updateRow(row.id, { amount: Number(e.target.value) })
                        }
                        className="w-28 text-right"
                      />
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleImport}
            disabled={isImporting || selectedCount === 0}
          >
            {isImporting
              ? "Importando..."
              : `Importar ${selectedCount} transações`}
          </Button>
        </div>
      )}
    </div>
  );
}
