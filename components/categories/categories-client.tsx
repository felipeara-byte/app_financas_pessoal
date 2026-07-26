"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { FALLBACK_CATEGORY_NAME } from "@/lib/constants/categories";
import type { CategoryRecord } from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  renameCategory,
  type CategoryActionState,
} from "@/app/(dashboard)/categories/actions";

const initialState: CategoryActionState = { error: null };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
      <Plus className="size-4" />
      {pending ? "Adicionando..." : "Adicionar"}
    </Button>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}

function AddCategoryForm({ type }: { type: "income" | "expense" }) {
  const [state, formAction] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const lastHandled = useRef(state);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.error) {
      toast.error(state.error);
      return;
    }
    toast.success("Categoria adicionada.");
    formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="type" value={type} />
      <Input
        name="name"
        placeholder="Nova categoria..."
        maxLength={40}
        required
        className="h-9"
      />
      <AddButton />
    </form>
  );
}

function CategoryRow({
  category,
  onRename,
  onDelete,
}: {
  category: CategoryRecord;
  onRename: (c: CategoryRecord) => void;
  onDelete: (c: CategoryRecord) => void;
}) {
  const isFallback = category.name === FALLBACK_CATEGORY_NAME;
  return (
    <li className="flex items-center justify-between gap-2 py-2">
      <span className="flex items-center gap-2.5 text-sm text-foreground">
        <span
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        {category.name}
      </span>
      <span className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={isFallback}
          onClick={() => onRename(category)}
        >
          Renomear
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isFallback}
          onClick={() => onDelete(category)}
        >
          Excluir
        </Button>
      </span>
    </li>
  );
}

function CategorySection({
  title,
  type,
  categories,
  onRename,
  onDelete,
}: {
  title: string;
  type: "income" | "expense";
  categories: CategoryRecord[];
  onRename: (c: CategoryRecord) => void;
  onDelete: (c: CategoryRecord) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma categoria ainda.</p>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </ul>
        )}
        <AddCategoryForm type={type} />
      </CardContent>
    </Card>
  );
}

export function CategoriesClient({
  income,
  expense,
}: {
  income: CategoryRecord[];
  expense: CategoryRecord[];
}) {
  const [renameTarget, setRenameTarget] = useState<CategoryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      const result = await deleteCategory(target.id);
      if (result.error) toast.error(result.error);
      else
        toast.success(
          `Categoria "${target.name}" excluída. Transações movidas para "${FALLBACK_CATEGORY_NAME}".`
        );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize as categorias de receitas e despesas. Ao excluir uma
          categoria, suas transações são movidas para &ldquo;
          {FALLBACK_CATEGORY_NAME}&rdquo;.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategorySection
          title="Receitas"
          type="income"
          categories={income}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
        />
        <CategorySection
          title="Despesas"
          type="expense"
          categories={expense}
          onRename={setRenameTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      <RenameDialog
        category={renameTarget}
        onClose={() => setRenameTarget(null)}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && (
                <>
                  As transações em &ldquo;{deleteTarget.name}&rdquo; serão movidas
                  para &ldquo;{FALLBACK_CATEGORY_NAME}&rdquo;. Esta ação não pode
                  ser desfeita.
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
    </div>
  );
}

function RenameDialog({
  category,
  onClose,
}: {
  category: CategoryRecord | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Renomear categoria</DialogTitle>
          <DialogDescription>
            As transações existentes serão atualizadas para o novo nome.
          </DialogDescription>
        </DialogHeader>
        {category && (
          <RenameForm key={category.id} category={category} onDone={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function RenameForm({
  category,
  onDone,
}: {
  category: CategoryRecord;
  onDone: () => void;
}) {
  const action = renameCategory.bind(null, category.id);
  const [state, formAction] = useActionState(action, initialState);
  const lastHandled = useRef(state);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;
    if (state.error) {
      toast.error(state.error);
      return;
    }
    toast.success("Categoria renomeada.");
    onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="name"
        defaultValue={category.name}
        maxLength={40}
        required
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancelar
        </Button>
        <SaveButton />
      </div>
    </form>
  );
}
