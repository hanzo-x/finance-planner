import { BUDGET_OVER_PERCENT, BUDGET_WARNING_PERCENT } from "./constants";

export type BudgetLevel = "ok" | "warning" | "over";

export function budgetPercent(spent: number, limit: number): number {
  if (!(limit > 0) || spent <= 0) return 0;
  return Math.floor((spent / limit) * 100);
}

export function budgetLevel(spent: number, limit: number): BudgetLevel {
  if (!(limit > 0)) return "ok";
  if (spent * 100 >= limit * BUDGET_OVER_PERCENT) return "over";
  if (spent * 100 >= limit * BUDGET_WARNING_PERCENT) return "warning";
  return "ok";
}

const LEVEL_ORDER: Record<BudgetLevel, number> = { ok: 0, warning: 1, over: 2 };

export function levelIncreased(before: BudgetLevel, after: BudgetLevel): boolean {
  return LEVEL_ORDER[after] > LEVEL_ORDER[before];
}

export function budgetWarningMessage(
  categoryLabel: string,
  level: BudgetLevel,
): string | null {
  if (level === "over") return `Bạn đã vượt ngân sách "${categoryLabel}" tháng này.`;
  if (level === "warning") {
    return `Bạn đã dùng hơn ${BUDGET_WARNING_PERCENT}% ngân sách "${categoryLabel}" tháng này.`;
  }
  return null;
}
