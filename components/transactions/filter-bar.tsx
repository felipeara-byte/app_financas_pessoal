"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_ITEMS } from "@/lib/constants/categories";
import {
  ALL_CATEGORIES_VALUE,
  ALL_MONTHS_VALUE,
  MONTH_OPTIONS,
  getYearOptions,
} from "@/lib/constants/filters";

export interface TransactionFiltersValue {
  month: string;
  year: string;
  category: string;
  search: string;
}

const MONTH_ITEMS = Object.fromEntries([
  [ALL_MONTHS_VALUE, "Todos os meses"],
  ...MONTH_OPTIONS.map((m) => [m.value, m.label]),
]);

const CATEGORY_FILTER_ITEMS = {
  [ALL_CATEGORIES_VALUE]: "Todas as categorias",
  ...CATEGORY_ITEMS,
};

export function FilterBar({ filters }: { filters: TransactionFiltersValue }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const yearOptions = getYearOptions(new Date().getFullYear());
  const yearItems = Object.fromEntries(yearOptions.map((y) => [y, y]));

  function updateParams(next: Partial<TransactionFiltersValue>) {
    const merged = { ...filters, ...next, search };
    const params = new URLSearchParams();
    if (merged.month === ALL_MONTHS_VALUE) {
      params.set("month", ALL_MONTHS_VALUE);
    } else {
      params.set("month", merged.month);
      params.set("year", merged.year);
    }
    params.set("category", merged.category);
    if (merged.search) {
      params.set("search", merged.search);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ search: value });
    }, 400);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          items={MONTH_ITEMS}
          value={filters.month}
          onValueChange={(value) => updateParams({ month: value as string })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MONTHS_VALUE}>Todos os meses</SelectItem>
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

        <Select
          items={CATEGORY_FILTER_ITEMS}
          value={filters.category}
          onValueChange={(value) => updateParams({ category: value as string })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES_VALUE}>
              Todas as categorias
            </SelectItem>
            {Object.keys(CATEGORY_ITEMS).map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Buscar por descrição..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full sm:max-w-xs"
        />
      </CardContent>
    </Card>
  );
}
