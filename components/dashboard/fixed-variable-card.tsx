import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function FixedVariableCard({
  fixedTotal,
  variableTotal,
}: {
  fixedTotal: number;
  variableTotal: number;
}) {
  const total = fixedTotal + variableTotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Despesas fixas x variáveis</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma despesa registrada neste período.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${(fixedTotal / total) * 100}%` }}
              />
              <div
                className="h-full bg-accent-foreground/30"
                style={{ width: `${(variableTotal / total) * 100}%` }}
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="size-2.5 shrink-0 rounded-full bg-primary" />
                  Fixas (recorrentes)
                </span>
                <span className="text-muted-foreground">
                  {currencyFormatter.format(fixedTotal)}{" "}
                  <span className="inline-block w-10 text-right tabular-nums">
                    {((fixedTotal / total) * 100).toFixed(0)}%
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground">
                  <span className="size-2.5 shrink-0 rounded-full bg-accent-foreground/30" />
                  Variáveis
                </span>
                <span className="text-muted-foreground">
                  {currencyFormatter.format(variableTotal)}{" "}
                  <span className="inline-block w-10 text-right tabular-nums">
                    {((variableTotal / total) * 100).toFixed(0)}%
                  </span>
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Uma despesa é considerada &ldquo;fixa&rdquo; quando uma descrição
              parecida aparece em pelo menos 2 meses diferentes no seu
              histórico — ajuste manualmente se algo estiver classificado
              errado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
