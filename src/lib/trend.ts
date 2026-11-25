import { vnYearMonth } from "./dates";

export type MonthBucket = {
  key: string;
  label: string;
  start: Date;
};

export type MonthPoint = MonthBucket & { income: number; expense: number };

function bucket(year: number, month: number): MonthBucket {
  const start = new Date(Date.UTC(year, month, 1));
  const y = start.getUTCFullYear();
  const m = String(start.getUTCMonth() + 1).padStart(2, "0");
  return { key: `${y}-${m}`, label: `${m}/${y}`, start };
}

export function lastMonths(now: Date = new Date(), count = 6): MonthBucket[] {
  const { year, month } = vnYearMonth(now);
  const result: MonthBucket[] = [];
  for (let i = count - 1; i >= 0; i--) result.push(bucket(year, month - i));
  return result;
}

export function monthsRange(months: MonthBucket[]): { gte: Date; lt: Date } {
  const first = months[0];
  const last = months[months.length - 1];
  const lt = new Date(Date.UTC(last.start.getUTCFullYear(), last.start.getUTCMonth() + 1, 1));
  return { gte: first.start, lt };
}

export type DayTypeSum = {
  date: Date;
  type: "INCOME" | "EXPENSE";
  _sum: { amount: number | null };
};

export function buildTrend(groups: DayTypeSum[], months: MonthBucket[]): MonthPoint[] {
  const points = new Map<string, MonthPoint>(
    months.map((m) => [m.key, { ...m, income: 0, expense: 0 }]),
  );
  for (const g of groups) {
    const point = points.get(g.date.toISOString().slice(0, 7));
    if (!point) continue;
    const value = g._sum.amount ?? 0;
    if (g.type === "INCOME") point.income += value;
    else point.expense += value;
  }
  return months.map((m) => points.get(m.key)!);
}
