"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  CATEGORY_ITEMS,
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
  onCancel,
}: {
  transaction?: Transaction | null;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const action = transaction
    ? updateTransaction.bind(null, transaction.id)
    : createTransaction;
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandledState = useRef(state);

  useEffect(() => {
    if (state === lastHandledState.current) return;
    lastHandledState.current = state;

    if (state.error) {
      toast.error(state.error);
      return;
    }

    toast.success(
      transaction ? "Transação atualizada." : "Transação adicionada."
    );
    formRef.current?.reset();
    onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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
          <Select
            name="type"
            items={TRANSACTION_TYPE_LABELS}
            defaultValue={transaction?.type ?? "expense"}
            required
          >
            <SelectTrigger id="type" className="w-full">
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
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            name="category"
            items={CATEGORY_ITEMS}
            defaultValue={transaction?.category ?? CATEGORIES[0]}
            required
          >
            <SelectTrigger id="category" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <SubmitButton label={transaction ? "Salvar alterações" : "Adicionar"} />
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
