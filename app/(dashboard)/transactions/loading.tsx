import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row">
          <Skeleton className="h-8 w-full sm:w-40" />
          <Skeleton className="h-8 w-full sm:w-28" />
          <Skeleton className="h-8 w-full sm:w-48" />
          <Skeleton className="h-8 w-full sm:max-w-xs" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
