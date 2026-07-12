"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Algo deu errado</CardTitle>
          <CardDescription>
            Não foi possível carregar esta página. Tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>Tentar novamente</Button>
        </CardContent>
      </Card>
    </div>
  );
}
