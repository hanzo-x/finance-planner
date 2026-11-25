import "server-only";
import { budgetLevel, budgetWarningMessage, levelIncreased } from "./budget";
import { CATEGORY_LABELS } from "./constants";
import { getDateRange } from "./dates";
import { prisma } from "./prisma";
import type { TransactionInput } from "./schemas";

export async function budgetWarningsAfterCreate(
  userId: string,
  input: TransactionInput,
  now: Date = new Date(),
): Promise<string[]> {
  if (input.type !== "EXPENSE") return [];
  const range = getDateRange("this", now);
  if (!range || input.date < range.gte || input.date >= range.lt) return [];

  const budget = await prisma.budget.findUnique({
    where: { userId_category: { userId, category: input.category } },
  });
  if (!budget) return [];

  const aggregate = await prisma.transaction.aggregate({
    where: {
      userId,
      type: "EXPENSE",
      category: input.category,
      date: { gte: range.gte, lt: range.lt },
    },
    _sum: { amount: true },
  });
  const after = aggregate._sum.amount ?? 0;
  const before = after - input.amount;

  const levelAfter = budgetLevel(after, budget.limit);
  if (!levelIncreased(budgetLevel(before, budget.limit), levelAfter)) return [];

  const message = budgetWarningMessage(CATEGORY_LABELS[input.category], levelAfter);
  return message ? [message] : [];
}
