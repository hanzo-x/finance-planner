import { CATEGORY_COLORS, CATEGORY_LABELS, type CategoryKey } from "./constants";

type Sum = { amount: number | null };

export type TypeGroup = { type: "INCOME" | "EXPENSE"; _sum: Sum };
export type CategoryGroup = { category: CategoryKey; _sum: Sum };

export function totalsFromGroups(groups: TypeGroup[]) {
  let income = 0;
  let expense = 0;
  for (const g of groups) {
    const value = g._sum.amount ?? 0;
    if (g.type === "INCOME") income += value;
    else expense += value;
  }
  return { income, expense, balance: income - expense };
}

export type PieSlice = {
  category: CategoryKey;
  label: string;
  total: number;
  percent: number;
  color: string;
};

export function pieDataFromGroups(groups: CategoryGroup[]): PieSlice[] {
  const items = groups
    .map((g) => ({ category: g.category, total: g._sum.amount ?? 0 }))
    .filter((g) => g.total > 0);
  const sum = items.reduce((acc, g) => acc + g.total, 0);
  if (sum === 0) return [];
  return items
    .sort((a, b) => b.total - a.total)
    .map((g) => ({
      category: g.category,
      label: CATEGORY_LABELS[g.category],
      total: g.total,
      percent: Math.round((g.total / sum) * 1000) / 10,
      color: CATEGORY_COLORS[g.category],
    }));
}
