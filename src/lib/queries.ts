import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { getDateRange } from "./dates";
import { prisma } from "./prisma";
import { totalsFromGroups } from "./summary";

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
