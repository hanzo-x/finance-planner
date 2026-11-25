import "server-only";
import { milestoneMessage, nextMilestoneToNotify } from "./milestones";
import { prisma } from "./prisma";
import { getBalanceTotals } from "./queries";

export type MilestoneResult = {
  messages: string[];
  celebrate: boolean;
};

export async function checkMilestones(userId: string): Promise<MilestoneResult> {
  const { balance } = await getBalanceTotals(userId);
  const items = await prisma.wishlistItem.findMany({ where: { userId } });
  const messages: string[] = [];
  let celebrate = false;

  for (const item of items) {
    const milestone = nextMilestoneToNotify(balance, item.cost, item.milestone);
    if (milestone === null) continue;

    const result = await prisma.wishlistItem.updateMany({
      where: { id: item.id, userId, milestone: item.milestone },
      data: { milestone },
    });
    if (result.count === 1) {
      messages.push(milestoneMessage(item.name, milestone));
      if (milestone >= 100) celebrate = true;
    }
  }
  return { messages, celebrate };
}
