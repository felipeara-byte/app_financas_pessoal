export const MONTH_OPTIONS = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
] as const;

export const ALL_MONTHS_VALUE = "all";
export const ALL_CATEGORIES_VALUE = "all";

export function getYearOptions(currentYear: number, span = 3): string[] {
  const years: string[] = [];
  for (let y = currentYear - span; y <= currentYear + 1; y++) {
    years.push(String(y));
  }
  return years;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function lastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Builds an inclusive YYYY-MM-DD date range spanning from the first day of
 * `fromMonth`/`fromYear` through the last day of `toMonth`/`toYear`. */
export function buildMonthRange(
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number
): { dateFrom: string; dateTo: string } {
  const dateFrom = `${fromYear}-${pad(fromMonth)}-01`;
  const dateTo = `${toYear}-${pad(toMonth)}-${pad(lastDayOfMonth(toYear, toMonth))}`;
  return { dateFrom, dateTo };
}
