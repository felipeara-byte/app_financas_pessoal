"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CATEGORIES,
  TRANSACTION_TYPES,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/constants/categories";
import type { Transaction } from "@/lib/types";
import {
  createTransaction,
  updateTransaction,
  type TransactionActionState,
} from "@/app/(dashboard)/transactions/actions";

const initialState: TransactionActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : label}
    </Button>
  );
}

export function TransactionForm({
  transaction,
  onDone,
}: {
  transaction?: Transaction | null;
  onDone?: () => void;
}) {
  const action = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandledState = useRef(state);

  useEffect(() => {
    if (state !== lastHandledState.current && state.error === null) {
      formRef.current?.reset();
      onDone?.();
    }
    lastHandledState.current = state;
  }, [state, onDone]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            name="description"
            defaultValue={transaction?.description}
            placeholder="Ex.: Supermercado"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={transaction?.amount}
            placeholder="0,00"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="transaction_date">Data</Label>
          <Input
            id="transaction_date"
            name="transaction_date"
            type="date"
            defaultValue={transaction?.transaction_date}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            id="type"
            name="type"
            defaultValue={transaction?.type ?? "expense"}
            required
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {TRANSACTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Categoria</Label>
          <select
            id="category"
            name="category"
            defaultValue={transaction?.category ?? CATEGORIES[0]}
            required
            className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <SubmitButton label={transaction ? "Salvar alterações" : "Adicionar"} />
        {transaction && onDone && (
          <Button type="button" variant="outline" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
