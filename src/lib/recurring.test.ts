import { describe, expect, it } from "vitest";
import {
  MAX_CATCH_UP,
  daysInMonth,
  dueOccurrences,
  nextOccurrence,
  occurrenceDate,
  startDateError,
} from "./recurring";

const d = (y: number, m: number, day: number) => new Date(Date.UTC(y, m - 1, day));
const iso = (dates: Date[]) => dates.map((x) => x.toISOString().slice(0, 10));

describe("daysInMonth / occurrenceDate", () => {
  it("số ngày của tháng, kể cả năm nhuận", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 3)).toBe(30);
  });

  it("ngày 31 ở tháng ngắn thì lùi về ngày cuối tháng", () => {
    expect(occurrenceDate(2026, 1, 31).toISOString().slice(0, 10)).toBe("2026-02-28");
    expect(occurrenceDate(2028, 1, 31).toISOString().slice(0, 10)).toBe("2028-02-29");
    expect(occurrenceDate(2026, 3, 31).toISOString().slice(0, 10)).toBe("2026-04-30");
    expect(occurrenceDate(2026, 4, 31).toISOString().slice(0, 10)).toBe("2026-05-31");
  });
});

describe("dueOccurrences", () => {
  it("chưa tới ngày bắt đầu -> không có gì", () => {
    const rule = { dayOfMonth: 5, startDate: d(2026, 12, 1), generatedThrough: null };
    expect(dueOccurrences(rule, d(2026, 11, 25))).toEqual([]);
  });

  it("ghi bù các tháng đã qua kể từ ngày bắt đầu", () => {
    const rule = { dayOfMonth: 5, startDate: d(2026, 8, 20), generatedThrough: null };
    expect(iso(dueOccurrences(rule, d(2026, 11, 25)))).toEqual(["2026-09-05", "2026-10-05", "2026-11-05"]);
  });

  it("trong tháng nhưng CHƯA tới ngày thì chưa ghi", () => {
    const rule = { dayOfMonth: 28, startDate: d(2026, 11, 1), generatedThrough: null };
    expect(dueOccurrences(rule, d(2026, 11, 25))).toEqual([]);
    expect(iso(dueOccurrences(rule, d(2026, 11, 28)))).toEqual(["2026-11-28"]);
  });

  it("không ghi lại những ngày đã ghi (generatedThrough) -> chạy lại nhiều lần không bị trùng", () => {
    const rule = { dayOfMonth: 5, startDate: d(2026, 8, 1), generatedThrough: d(2026, 10, 20) };
    expect(iso(dueOccurrences(rule, d(2026, 11, 25)))).toEqual(["2026-11-05"]);
    expect(dueOccurrences({ ...rule, generatedThrough: d(2026, 11, 25) }, d(2026, 11, 25))).toEqual([]);
  });

  it("ngày 31: tháng 2 lùi về 28, qua năm mới vẫn đúng", () => {
    const rule = { dayOfMonth: 31, startDate: d(2026, 12, 1), generatedThrough: null };
    expect(iso(dueOccurrences(rule, d(2027, 3, 1)))).toEqual(["2026-12-31", "2027-01-31", "2027-02-28"]);
  });

  it("an toàn: không ghi quá MAX_CATCH_UP giao dịch trong một lần", () => {
    const rule = { dayOfMonth: 1, startDate: d(2000, 1, 1), generatedThrough: null };
    expect(dueOccurrences(rule, d(2026, 11, 25))).toHaveLength(MAX_CATCH_UP);
  });
});

describe("nextOccurrence", () => {
  it("lần tới trong tháng này nếu chưa qua ngày", () => {
    const rule = { dayOfMonth: 28, startDate: d(2026, 1, 1), generatedThrough: d(2026, 11, 25) };
    expect(nextOccurrence(rule, d(2026, 11, 25))?.toISOString().slice(0, 10)).toBe("2026-11-28");
  });

  it("đã qua ngày trong tháng thì sang tháng sau (kể cả qua năm mới)", () => {
    const rule = { dayOfMonth: 5, startDate: d(2026, 1, 1), generatedThrough: d(2026, 12, 20) };
    expect(nextOccurrence(rule, d(2026, 12, 20))?.toISOString().slice(0, 10)).toBe("2027-01-05");
  });

  it("chưa tới ngày bắt đầu thì lần tới là ngày đầu tiên sau ngày bắt đầu", () => {
    const rule = { dayOfMonth: 10, startDate: d(2027, 2, 1), generatedThrough: null };
    expect(nextOccurrence(rule, d(2026, 11, 25))?.toISOString().slice(0, 10)).toBe("2027-02-10");
  });
});

describe("startDateError", () => {
  const today = d(2026, 11, 25);
  it("hợp lệ: gần hôm nay", () => {
    expect(startDateError(d(2026, 11, 1), today)).toBeNull();
    expect(startDateError(d(2026, 12, 25), today)).toBeNull();
  });
  it("cũ hơn 2 năm bị từ chối", () => {
    expect(startDateError(d(2024, 1, 1), today)).toMatch(/2 năm/);
  });
  it("xa hơn 1 năm trong tương lai bị từ chối", () => {
    expect(startDateError(d(2028, 1, 1), today)).toMatch(/1 năm/);
  });
});
