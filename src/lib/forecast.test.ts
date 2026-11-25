import { describe, expect, it } from "vitest";
import {
  FORECAST_MAX_WINDOW_DAYS,
  FORECAST_MIN_WINDOW_DAYS,
  forecastGoal,
  forecastMessage,
  forecastWindowDays,
} from "./forecast";

const today = new Date(Date.UTC(2026, 10, 25));

describe("forecastWindowDays", () => {
  it("tài khoản mới (vài ngày dữ liệu) vẫn chia cho ít nhất 30 ngày", () => {
    expect(forecastWindowDays(0)).toBe(FORECAST_MIN_WINDOW_DAYS);
    expect(forecastWindowDays(10)).toBe(FORECAST_MIN_WINDOW_DAYS);
  });

  it("dữ liệu từ 30 đến 90 ngày thì dùng đúng số ngày đó (tính cả hôm nay)", () => {
    expect(forecastWindowDays(59)).toBe(60);
  });

  it("dữ liệu lâu hơn 90 ngày thì chỉ nhìn 90 ngày gần nhất", () => {
    expect(forecastWindowDays(400)).toBe(FORECAST_MAX_WINDOW_DAYS);
  });
});

describe("forecastGoal", () => {
  it("đã đủ tiền -> reached", () => {
    expect(forecastGoal({ balance: 5_000_000, cost: 5_000_000, recentNet: 0, windowDays: 30, today })).toEqual({
      status: "reached",
    });
  });

  it("gần đây không để dành được (net <= 0) -> no-trend", () => {
    expect(forecastGoal({ balance: 0, cost: 1_000_000, recentNet: 0, windowDays: 30, today }).status).toBe("no-trend");
    expect(forecastGoal({ balance: 0, cost: 1_000_000, recentNet: -500_000, windowDays: 30, today }).status).toBe(
      "no-trend",
    );
  });

  it("windowDays = 0 không gây chia cho 0 -> no-trend", () => {
    expect(forecastGoal({ balance: 0, cost: 1_000_000, recentNet: 1_000_000, windowDays: 0, today }).status).toBe(
      "no-trend",
    );
  });

  it("tính đúng số ngày và ngày đạt được", () => {
    const result = forecastGoal({ balance: 1_000_000, cost: 2_000_000, recentNet: 3_000_000, windowDays: 30, today });
    expect(result).toEqual({ status: "on-track", days: 10, date: new Date(Date.UTC(2026, 11, 5)) });
  });

  it("làm tròn LÊN số ngày (thiếu 1 đồng cũng cần thêm 1 ngày)", () => {
    const result = forecastGoal({ balance: 0, cost: 100_001, recentNet: 3_000_000, windowDays: 30, today });
    expect(result).toMatchObject({ status: "on-track", days: 2 });
  });

  it("số dư âm thì phải bù thêm phần âm", () => {
    const result = forecastGoal({ balance: -1_000_000, cost: 1_000_000, recentNet: 3_000_000, windowDays: 30, today });
    expect(result).toMatchObject({ status: "on-track", days: 20 });
  });

  it("quá 10 năm -> too-far", () => {
    const result = forecastGoal({ balance: 0, cost: 2_000_000_000, recentNet: 30_000, windowDays: 30, today });
    expect(result.status).toBe("too-far");
  });
});

describe("forecastMessage", () => {
  it("đã đủ tiền -> không cần câu nào", () => {
    expect(forecastMessage({ status: "reached" })).toBeNull();
  });

  it("gần (<= 60 ngày) hiện ngày cụ thể", () => {
    const text = forecastMessage({ status: "on-track", days: 10, date: new Date(Date.UTC(2026, 11, 5)) });
    expect(text).toContain("05/12/2026");
    expect(text).toContain("10 ngày");
  });

  it("xa (> 60 ngày) chỉ hiện tháng/năm", () => {
    const text = forecastMessage({ status: "on-track", days: 400, date: new Date(Date.UTC(2027, 11, 30)) });
    expect(text).toContain("tháng 12/2027");
    expect(text).toContain("13 tháng");
  });

  it("no-trend và too-far có câu riêng", () => {
    expect(forecastMessage({ status: "no-trend" })).toContain("chưa để dành được");
    expect(forecastMessage({ status: "too-far" })).toContain("10 năm");
  });
});
