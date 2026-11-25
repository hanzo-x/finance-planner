import { daysBetween } from "./dates";

export const MAX_RECURRING_PER_USER = 30;
export const MAX_START_PAST_DAYS = 730;
export const MAX_START_FUTURE_DAYS = 366;
export const MAX_CATCH_UP = 120;

export type RecurringRule = {
  dayOfMonth: number;
  startDate: Date;
  generatedThrough: Date | null;
};

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export function occurrenceDate(year: number, month: number, dayOfMonth: number): Date {
  return new Date(Date.UTC(year, month, Math.min(dayOfMonth, daysInMonth(year, month))));
}

export function dueOccurrences(rule: RecurringRule, today: Date): Date[] {
  const result: Date[] = [];
  const from =
    rule.generatedThrough && rule.generatedThrough.getTime() > rule.startDate.getTime()
      ? rule.generatedThrough
      : rule.startDate;
  let year = from.getUTCFullYear();
  let month = from.getUTCMonth();
  const endYear = today.getUTCFullYear();
  const endMonth = today.getUTCMonth();

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const date = occurrenceDate(year, month, rule.dayOfMonth);
    const afterStart = date.getTime() >= rule.startDate.getTime();
    const notFuture = date.getTime() <= today.getTime();
    const notDoneYet = rule.generatedThrough === null || date.getTime() > rule.generatedThrough.getTime();
    if (afterStart && notFuture && notDoneYet) {
      result.push(date);
      if (result.length >= MAX_CATCH_UP) break;
    }
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return result;
}

export function nextOccurrence(rule: RecurringRule, today: Date): Date | null {
  let year = today.getUTCFullYear();
  let month = today.getUTCMonth();
  for (let i = 0; i < 26; i++) {
    const date = occurrenceDate(year, month, rule.dayOfMonth);
    const afterToday = date.getTime() > today.getTime();
    const afterStart = date.getTime() >= rule.startDate.getTime();
    const notDoneYet = rule.generatedThrough === null || date.getTime() > rule.generatedThrough.getTime();
    if (afterToday && afterStart && notDoneYet) return date;
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }
  return null;
}

export function startDateError(startDate: Date, today: Date): string | null {
  const diff = daysBetween(today, startDate);
  if (diff < -MAX_START_PAST_DAYS) return "Ngày bắt đầu không được cũ hơn 2 năm";
  if (diff > MAX_START_FUTURE_DAYS) return "Ngày bắt đầu không được xa hơn 1 năm";
  return null;
}
