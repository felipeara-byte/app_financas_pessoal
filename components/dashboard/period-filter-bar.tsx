"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_CATEGORIES_VALUE, MONTH_OPTIONS } from "@/lib/constants/filters";

export interface PeriodFilterValue {
  fromMonth: string;
  fromYear: string;
  toMonth: string;
  toYear: string;
  category: string;
}

const MONTH_ITEMS = Object.fromEntries(MONTH_OPTIONS.map((m) => [m.value, m.label]));

export function PeriodFilterBar({
  filters,
  yearOptions,
  categoryNames,
}: {
  filters: PeriodFilterValue;
  yearOptions: string[];
  categoryNames: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const yearItems = Object.fromEntries(yearOptions.map((y) => [y, y]));
  const categoryFilterItems = {
    [ALL_CATEGORIES_VALUE]: "Todas as categorias",
    ...Object.fromEntries(categoryNames.map((name) => [name, name])),
  };

  function updateParams(next: Partial<PeriodFilterValue>) {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams({
      from_month: merged.fromMonth,
      from_year: merged.fromYear,
      to_month: merged.toMonth,
      to_year: merged.toYear,
      category: merged.category,
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">De</Label>
          <div className="flex gap-2">
            <Select
              items={MONTH_ITEMS}
              value={filters.fromMonth}
              onValueChange={(value) => updateParams({ fromMonth: value as string })}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={yearItems}
              value={filters.fromYear}
              onValueChange={(value) => updateParams({ fromYear: value as string })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">Até</Label>
          <div className="flex gap-2">
            <Select
              items={MONTH_ITEMS}
              value={filters.toMonth}
              onValueChange={(value) => updateParams({ toMonth: value as string })}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              items={yearItems}
              value={filters.toYear}
              onValueChange={(value) => updateParams({ toYear: value as string })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <Select
            items={categoryFilterItems}
            value={filters.category}
            onValueChange={(value) => updateParams({ category: value as string })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES_VALUE}>
                Todas as categorias
              </SelectItem>
              {categoryNames.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
