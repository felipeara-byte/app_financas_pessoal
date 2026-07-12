"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { EXPENSE_CATEGORY_COLORS } from "@/lib/constants/category-colors";
import type { Category } from "@/lib/constants/categories";

export interface CategoryBreakdownItem {
  category: Category;
  total: number;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function categoryColor(category: Category) {
  return EXPENSE_CATEGORY_COLORS[category] ?? "var(--muted-foreground)";
}

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-popover-foreground">
        {currencyFormatter.format(Number(entry.value ?? 0))}
      </p>
      <p className="text-muted-foreground">{entry.name}</p>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategoryBreakdownItem[] }) {
  const total = data.reduce((sum, entry) => sum + entry.total, 0);

  if (data.length === 0 || total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma despesa registrada neste período.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-56 w-full sm:w-56 sm:shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius="55%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={2}
              stroke="var(--card)"
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={categoryColor(entry.category)} />
              ))}
            </Pie>
            <Tooltip content={ChartTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-1 flex-col gap-2 text-sm">
        {data.map((entry) => (
          <li
            key={entry.category}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2 text-foreground">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColor(entry.category) }}
              />
              {entry.category}
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              {currencyFormatter.format(entry.total)}
              <span className="w-10 text-right tabular-nums">
                {((entry.total / total) * 100).toFixed(0)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
