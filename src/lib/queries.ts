import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDateRange } from "./dates";
import { prisma } from "./prisma";
import type { Filters } from "./schemas";
import { totalsFromGroups } from "./summary";

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

export function getMonthTotals(userId: string, now: Date = new Date()) {
  const range = getDateRange("this", now);
  if (!range) throw new Error("unreachable");
  return getTotals({ userId, date: { gte: range.gte, lt: range.lt } });
}
