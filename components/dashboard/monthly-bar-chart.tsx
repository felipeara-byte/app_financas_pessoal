"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

export interface MonthlyTotal {
  month: string;
  income: number;
  expense: number;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const compactCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const SERIES_LABELS: Record<string, string> = {
  income: "Receita",
  expense: "Despesa",
  cumulative: "Saldo acumulado",
};

function ChartTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium text-popover-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {SERIES_LABELS[String(entry.name)] ?? entry.name}:{" "}
          <span className="font-medium text-foreground">
            {currencyFormatter.format(Math.abs(Number(entry.value ?? 0)))}
          </span>
        </p>
      ))}
    </div>
  );
}

export function MonthlyBarChart({ data }: { data: MonthlyTotal[] }) {
  const hasData = data.some((d) => d.income !== 0 || d.expense !== 0);

  if (!hasData) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma transação registrada neste ano.
      </p>
    );
  }

  const chartData = data.map((d, index) => ({
    month: d.month,
    income: d.income,
    expense: d.expense,
    cumulative: data
      .slice(0, index + 1)
      .reduce((sum, m) => sum + m.income - m.expense, 0),
  }));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-success" />
          Receita
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-destructive" />
          Despesa
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-primary" />
          Saldo acumulado
        </span>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} barGap={2} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(value) => compactCurrencyFormatter.format(value)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(value) => compactCurrencyFormatter.format(value)}
            />
            <ReferenceLine yAxisId="left" y={0} stroke="var(--border)" />
            <Tooltip content={ChartTooltip} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
            <Bar
              yAxisId="left"
              dataKey="income"
              name="income"
              fill="var(--success)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              yAxisId="left"
              dataKey="expense"
              name="expense"
              fill="var(--destructive)"
              radius={[3, 3, 0, 0]}
            />
            <Line
              yAxisId="right"
              dataKey="cumulative"
              name="cumulative"
              type="monotone"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--primary)" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
