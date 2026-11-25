import { MILESTONES } from "./constants";

export function progressPercent(balance: number, cost: number): number {
  if (!(cost > 0) || balance <= 0) return 0;
  return Math.min(100, Math.floor((balance / cost) * 100));
}

export function reachedMilestone(percent: number): number {
  let reached = 0;
  for (const m of MILESTONES) {
    if (percent >= m) reached = m;
  }
  return reached;
}

export function nextMilestoneToNotify(
  balance: number,
  cost: number,
  lastNotified: number,
): number | null {
  const reached = reachedMilestone(progressPercent(balance, cost));
  return reached > lastNotified ? reached : null;
}

export function milestoneMessage(itemName: string, milestone: number): string {
  if (milestone >= 100) {
    return `Chúc mừng! Bạn đã đủ tiền cho "${itemName}" 🎉`;
  }
  return `Bạn đã tiết kiệm được ${milestone}% cho "${itemName}"!`;
}
