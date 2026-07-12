"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ALL_MONTHS_VALUE, MONTH_OPTIONS, getYearOptions } from "@/lib/constants/filters";

export interface PeriodFilterValue {
  month: string;
  year: string;
}

const MONTH_ITEMS = Object.fromEntries([
  [ALL_MONTHS_VALUE, "Todos os períodos"],
  ...MONTH_OPTIONS.map((m) => [m.value, m.label]),
]);

export function PeriodFilterBar({ filters }: { filters: PeriodFilterValue }) {
  const router = useRouter();
  const pathname = usePathname();

  const yearOptions = getYearOptions(new Date().getFullYear());
  const yearItems = Object.fromEntries(yearOptions.map((y) => [y, y]));

  function updateParams(next: Partial<PeriodFilterValue>) {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    if (merged.month === ALL_MONTHS_VALUE) {
      params.set("month", ALL_MONTHS_VALUE);
    } else {
      params.set("month", merged.month);
      params.set("year", merged.year);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select
          items={MONTH_ITEMS}
          value={filters.month}
          onValueChange={(value) => updateParams({ month: value as string })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MONTHS_VALUE}>Todos os períodos</SelectItem>
            {MONTH_OPTIONS.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters.month !== ALL_MONTHS_VALUE && (
          <Select
            items={yearItems}
            value={filters.year}
            onValueChange={(value) => updateParams({ year: value as string })}
          >
            <SelectTrigger className="w-full sm:w-28">
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
        )}
      </CardContent>
    </Card>
  );
}
