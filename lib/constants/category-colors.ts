// The validated chart color slots defined in app/globals.css. New categories
// are auto-assigned a color from this palette.
export const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
] as const;

/**
 * Picks the next palette color not already used within a type. Once every slot
 * is taken it cycles back around, so there's always a color to assign.
 */
export function nextCategoryColor(usedColors: string[]): string {
  const free = CHART_PALETTE.find((color) => !usedColors.includes(color));
  return free ?? CHART_PALETTE[usedColors.length % CHART_PALETTE.length];
}

/** Builds a category-name -> color lookup for charts of a single type. */
export function colorMap(
  categories: { name: string; color: string }[]
): Record<string, string> {
  return Object.fromEntries(categories.map((c) => [c.name, c.color]));
}
