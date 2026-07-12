import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
      <Card>
        <CardHeader>
          <CardTitle>Em construção</CardTitle>
          <CardDescription>
            O CRUD de transações chega na próxima etapa.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
