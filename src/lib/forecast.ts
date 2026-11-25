import { addDays, formatDateVi } from "./dates";

export const FORECAST_MAX_WINDOW_DAYS = 90;
export const FORECAST_MIN_WINDOW_DAYS = 30;
export const FORECAST_MAX_DAYS = 3650;

export type Forecast =
  | { status: "reached" }
  | { status: "no-trend" }
  | { status: "too-far" }
  | { status: "on-track"; days: number; date: Date };

export function forecastWindowDays(daysSinceFirstTransaction: number): number {
  const days = Math.floor(daysSinceFirstTransaction) + 1;
  return Math.min(FORECAST_MAX_WINDOW_DAYS, Math.max(FORECAST_MIN_WINDOW_DAYS, days));
}

export function forecastGoal(input: {
  balance: number;
  cost: number;
  recentNet: number;
  windowDays: number;
  today: Date;
}): Forecast {
  const { balance, cost, recentNet, windowDays, today } = input;
  if (balance >= cost) return { status: "reached" };

  const perDay = windowDays > 0 ? recentNet / windowDays : 0;
  if (!(perDay > 0)) return { status: "no-trend" };

  const days = Math.ceil((cost - balance) / perDay);
  if (days > FORECAST_MAX_DAYS) return { status: "too-far" };
  return { status: "on-track", days, date: addDays(today, days) };
}

export function forecastMessage(forecast: Forecast): string | null {
  switch (forecast.status) {
    case "reached":
      return null;
    case "no-trend":
      return "Chưa dự báo được vì gần đây bạn chưa để dành được tiền (thu chưa vượt chi).";
    case "too-far":
      return "Với tốc độ hiện tại, bạn cần hơn 10 năm mới đủ tiền.";
    case "on-track": {
      if (forecast.days <= 60) {
        return `Với tốc độ hiện tại, bạn sẽ đủ tiền vào khoảng ${formatDateVi(forecast.date)} (còn khoảng ${forecast.days} ngày).`;
      }
      const month = String(forecast.date.getUTCMonth() + 1).padStart(2, "0");
      const months = Math.round(forecast.days / 30);
      return `Với tốc độ hiện tại, bạn sẽ đủ tiền vào khoảng tháng ${month}/${forecast.date.getUTCFullYear()} (còn khoảng ${months} tháng).`;
    }
  }
}

export function forecastHint(input: Parameters<typeof forecastGoal>[0]): string | null {
  return forecastMessage(forecastGoal(input));
}
