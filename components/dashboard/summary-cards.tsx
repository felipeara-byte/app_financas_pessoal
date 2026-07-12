import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function SummaryCards({
  totalIncome,
  totalExpense,
}: {
  totalIncome: number;
  totalExpense: number;
}) {
  const balance = totalIncome - totalExpense;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            Receita total
            <ArrowUpCircle className="size-4 text-success" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-success">
            {currencyFormatter.format(totalIncome)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            Despesa total
            <ArrowDownCircle className="size-4 text-destructive" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-destructive">
            {currencyFormatter.format(totalExpense)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            Saldo do mês
            <Wallet className="size-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-semibold ${
              balance >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {currencyFormatter.format(balance)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
