import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function TopTransactionsCard({
  transactions,
  type,
  limit = 5,
}: {
  transactions: Transaction[];
  type: "income" | "expense";
  limit?: number;
}) {
  const top = [...transactions]
    .filter((t) => t.type === type)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);

  const title = type === "expense" ? "Maiores despesas" : "Maiores receitas";
  const emptyMessage =
    type === "expense"
      ? "Nenhuma despesa registrada neste período."
      : "Nenhuma receita registrada neste período.";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {top.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-foreground">
                    {t.description}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(`${t.transaction_date}T00:00:00Z`))}
                    <Badge variant="secondary">{t.category}</Badge>
                  </span>
                </div>
                <span
                  className={`shrink-0 font-medium whitespace-nowrap ${
                    t.type === "income" ? "text-success" : "text-destructive"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {currencyFormatter.format(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
