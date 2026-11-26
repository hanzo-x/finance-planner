export type Period = "this" | "last" | "all";

export const PERIODS: readonly Period[] = ["this", "last", "all"];

export const PERIOD_LABELS: Record<Period, string> = {
  this: "Tháng này",
  last: "Tháng trước",
  all: "Tất cả",
};

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getDateRange(
  period: Period,
  now: Date = new Date(),
): { gte: Date; lt: Date } | null {
  if (period === "all") return null;

  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  let year = vn.getUTCFullYear();
  let month = vn.getUTCMonth();

  if (period === "last") {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }

  return {
    gte: new Date(Date.UTC(year, month, 1)),
    lt: new Date(Date.UTC(year, month + 1, 1)),
  };
}

export function todayInputValue(now: Date = new Date()): string {
  return new Date(now.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);
}

export function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (toDateInputValue(date) !== value) return null;
  return date;
}

export function formatDateVi(date: Date): string {
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getUTCFullYear()}`;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfTodayVn(now: Date = new Date()): Date {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function vnYearMonth(now: Date = new Date()): { year: number; month: number } {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  return { year: vn.getUTCFullYear(), month: vn.getUTCMonth() };
}

export function previousMonthSamePeriod(now: Date = new Date()): { gte: Date; lt: Date } {
  const vn = new Date(now.getTime() + VN_OFFSET_MS);
  const year = vn.getUTCFullYear();
  const month = vn.getUTCMonth();
  const day = vn.getUTCDate();
  const gte = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));
  const lt = new Date(Math.min(Date.UTC(year, month - 1, day + 1), monthEnd.getTime()));
  return { gte, lt };
}
