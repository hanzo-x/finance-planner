import "server-only";
import { startOfTodayVn } from "./dates";
import { prisma } from "./prisma";
import { dueOccurrences } from "./recurring";

export async function syncRecurring(userId: string): Promise<number> {
  try {
    const today = startOfTodayVn();
    const rules = await prisma.recurringTransaction.findMany({
      where: { userId, active: true, startDate: { lte: today } },
    });

    let created = 0;
    for (const rule of rules) {
      const dates = dueOccurrences(rule, today);
      if (dates.length === 0) continue;

      const count = await prisma.$transaction(async (tx) => {
        const claimed = await tx.recurringTransaction.updateMany({
          where: { id: rule.id, userId, active: true, generatedThrough: rule.generatedThrough },
          data: { generatedThrough: dates[dates.length - 1] },
        });
        if (claimed.count === 0) return 0;

        const result = await tx.transaction.createMany({
          data: dates.map((date) => ({
            userId,
            type: rule.type,
            amount: rule.amount,
            description: rule.description,
            category: rule.category,
            date,
            recurringId: rule.id,
          })),
          skipDuplicates: true,
        });
        return result.count;
      });
      created += count;
    }
    return created;
  } catch (error) {
    console.error("[syncRecurring]", error);
    return 0;
  }
}
