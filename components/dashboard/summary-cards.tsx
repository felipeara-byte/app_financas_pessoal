import { ArrowDownCircle, ArrowUpCircle, PiggyBank, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { percentChange } from "@/lib/dashboard/insights";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 1,
  signDisplay: "always",
});

function DeltaLabel({
  percent,
  isGood,
  suffix = "vs período anterior",
}: {
  percent: number | null;
  isGood: boolean;
  suffix?: string;
}) {
  if (percent === null) {
    return <p className="mt-1 text-xs text-muted-foreground">Novo — sem período anterior</p>;
  }
  return (
    <p className={`mt-1 text-xs ${isGood ? "text-success" : "text-destructive"}`}>
      {percentFormatter.format(percent)}% {suffix}
    </p>
  );
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  previousIncome,
  previousExpense,
}: {
  totalIncome: number;
  totalExpense: number;
  previousIncome: number;
  previousExpense: number;
}) {
  const balance = totalIncome - totalExpense;
  const previousBalance = previousIncome - previousExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
  const previousSavingsRate = previousIncome > 0 ? (previousBalance / previousIncome) * 100 : 0;

  const incomeDelta = percentChange(totalIncome, previousIncome);
  const expenseDelta = percentChange(totalExpense, previousExpense);
  const balanceDelta = percentChange(balance, previousBalance);
  const hasPreviousIncomeOrExpense = previousIncome !== 0 || previousExpense !== 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <DeltaLabel percent={incomeDelta} isGood={(incomeDelta ?? 0) >= 0} />
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
          <DeltaLabel percent={expenseDelta} isGood={(expenseDelta ?? 0) <= 0} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            Saldo do período
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
          <DeltaLabel percent={balanceDelta} isGood={(balanceDelta ?? 0) >= 0} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            Taxa de poupança
            <PiggyBank className="size-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-2xl font-semibold ${
              savingsRate >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {percentFormatter.format(savingsRate).replace("+", "")}%
          </p>
          {hasPreviousIncomeOrExpense ? (
            <p
              className={`mt-1 text-xs ${
                savingsRate - previousSavingsRate >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {percentFormatter.format(savingsRate - previousSavingsRate)} p.p. vs período anterior
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Novo — sem período anterior</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
