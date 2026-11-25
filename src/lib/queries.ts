import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { budgetLevel, budgetPercent, type BudgetLevel } from "./budget";
import { BUDGET_CATEGORIES, type CategoryKey } from "./constants";
import { addDays, daysBetween, getDateRange, startOfTodayVn } from "./dates";
import { FORECAST_MIN_WINDOW_DAYS, forecastWindowDays } from "./forecast";
import { prisma } from "./prisma";
import type { Filters } from "./schemas";
import { totalsFromGroups } from "./summary";
import { buildTrend, lastMonths, monthsRange } from "./trend";

export function buildTransactionWhere(
  userId: string,
  filters: Filters,
  now: Date = new Date(),
): Prisma.TransactionWhereInput {
  const range = getDateRange(filters.period, now);
  return {
    userId,
    ...(range ? { date: { gte: range.gte, lt: range.lt } } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.type ? { type: filters.type } : {}),
  };
}

export async function getTotals(where: Prisma.TransactionWhereInput) {
  const groups = await prisma.transaction.groupBy({
    by: ["type"],
    where,
    _sum: { amount: true },
  });
  return totalsFromGroups(groups);
}

export function getBalanceTotals(userId: string) {
  return getTotals({ userId });
}

export function getFilteredTransactions(userId: string, filters: Filters, now = new Date()) {
  return prisma.transaction.findMany({
    where: buildTransactionWhere(userId, filters, now),
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 500,
  });
}

export function getRecentTransactions(userId: string, count = 5) {
  return prisma.transaction.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: count,
  });
}

export async function getMonthExpenseGroups(userId: string, now = new Date()) {
  const range = getDateRange("this", now);
  if (!range) throw new Error("unreachable");
  const groups = await prisma.transaction.groupBy({
    by: ["category"],
    where: { userId, type: "EXPENSE", date: { gte: range.gte, lt: range.lt } },
    _sum: { amount: true },
  });
  return groups;
}

export async function getRecurringRules(userId: string) {
  const rules = await prisma.recurringTransaction.findMany({ where: { userId } });
  return rules.sort(
    (a, b) => Number(b.active) - Number(a.active) || a.dayOfMonth - b.dayOfMonth || a.createdAt.getTime() - b.createdAt.getTime(),
  );
}

export async function getExpenseTotal(userId: string, range: { gte: Date; lt: Date }) {
  const result = await prisma.transaction.aggregate({
    where: { userId, type: "EXPENSE", date: { gte: range.gte, lt: range.lt } },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getSavingsTrend(userId: string, now = new Date()) {
  const today = startOfTodayVn(now);
  const first = await prisma.transaction.aggregate({ where: { userId }, _min: { date: true } });
  if (!first._min.date) return { recentNet: 0, windowDays: FORECAST_MIN_WINDOW_DAYS, today };

  const windowDays = forecastWindowDays(daysBetween(first._min.date, today));
  const since = addDays(today, -(windowDays - 1));
  const { balance } = await getTotals({ userId, date: { gte: since, lte: today } });
  return { recentNet: balance, windowDays, today };
}

export async function getMonthlyTrend(userId: string, now = new Date()) {
  const months = lastMonths(now, 6);
  const range = monthsRange(months);
  const groups = await prisma.transaction.groupBy({
    by: ["date", "type"],
    where: { userId, date: { gte: range.gte, lt: range.lt } },
    _sum: { amount: true },
  });
  return buildTrend(groups, months);
}

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

export async function getWishlist(userId: string) {
  const items = await prisma.wishlistItem.findMany({ where: { userId } });
  return items.sort(
    (a, b) =>
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export type BudgetRow = {
  category: CategoryKey;
  budgetId: string | null;
  limit: number | null;
  spent: number;
  percent: number;
  level: BudgetLevel;
};

export async function getBudgetRows(userId: string, now = new Date()): Promise<BudgetRow[]> {
  const [budgets, groups] = await Promise.all([
    prisma.budget.findMany({ where: { userId } }),
    getMonthExpenseGroups(userId, now),
  ]);
  const spentBy = new Map(groups.map((g) => [g.category, g._sum.amount ?? 0]));
  const budgetBy = new Map(budgets.map((b) => [b.category, b]));

  return BUDGET_CATEGORIES.map((category) => {
    const budget = budgetBy.get(category);
    const spent = spentBy.get(category) ?? 0;
    return {
      category,
      budgetId: budget?.id ?? null,
      limit: budget?.limit ?? null,
      spent,
      percent: budget ? budgetPercent(spent, budget.limit) : 0,
      level: budget ? budgetLevel(spent, budget.limit) : "ok",
    };
  });
}
