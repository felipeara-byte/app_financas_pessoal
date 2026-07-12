import type { Transaction } from "@/lib/types";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants/categories";

const HEADERS = ["Data", "Descrição", "Categoria", "Tipo", "Valor"];
const BOM = "﻿";

function escapeCsvField(value: string): string {
  if (/["\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(transactions: Transaction[]): string {
  const rows = transactions.map((t) => [
    t.transaction_date.split("-").reverse().join("/"),
    t.description,
    t.category,
    TRANSACTION_TYPE_LABELS[t.type],
    t.amount.toFixed(2).replace(".", ","),
  ]);

  const lines = [HEADERS, ...rows].map((row) =>
    row.map(escapeCsvField).join(";")
  );

  return BOM + lines.join("\r\n");
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
