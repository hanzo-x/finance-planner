import { describe, expect, it } from "vitest";
import { buildTrend, lastMonths, monthsRange } from "./trend";

describe("lastMonths", () => {
  it("6 tháng gần nhất, xếp từ cũ đến mới, tính cả tháng hiện tại", () => {
    const months = lastMonths(new Date("2026-11-25T03:00:00Z"));
    expect(months.map((m) => m.key)).toEqual([
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
    expect(months[5].label).toBe("11/2026");
  });

  it("đầu năm: lùi sang năm trước đúng", () => {
    const months = lastMonths(new Date("2027-02-10T03:00:00Z"));
    expect(months.map((m) => m.label)).toEqual(["09/2026", "10/2026", "11/2026", "12/2026", "01/2027", "02/2027"]);
  });

  it("tính tháng theo giờ Việt Nam: 17:30 UTC ngày 30/11 đã là 01/12 ở Việt Nam", () => {
    const months = lastMonths(new Date("2026-11-30T17:30:00Z"), 1);
    expect(months[0].key).toBe("2026-12");
  });
});

describe("monthsRange", () => {
  it("bao từ mùng 1 tháng đầu đến mùng 1 tháng sau tháng cuối", () => {
    const months = lastMonths(new Date("2026-12-15T00:00:00Z"), 3);
    const range = monthsRange(months);
    expect(range.gte.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(range.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("buildTrend", () => {
  const months = lastMonths(new Date("2026-11-25T03:00:00Z"), 3);

  it("cộng thu/chi theo tháng và để 0 cho tháng không có giao dịch", () => {
    const points = buildTrend(
      [
        { date: new Date("2026-11-01T00:00:00Z"), type: "INCOME", _sum: { amount: 12_000_000 } },
        { date: new Date("2026-11-05T00:00:00Z"), type: "EXPENSE", _sum: { amount: 300_000 } },
        { date: new Date("2026-11-20T00:00:00Z"), type: "EXPENSE", _sum: { amount: 200_000 } },
        { date: new Date("2026-09-15T00:00:00Z"), type: "EXPENSE", _sum: { amount: 1_000_000 } },
      ],
      months,
    );
    expect(points.map((p) => [p.key, p.income, p.expense])).toEqual([
      ["2026-09", 0, 1_000_000],
      ["2026-10", 0, 0],
      ["2026-11", 12_000_000, 500_000],
    ]);
  });

  it("bỏ qua dòng nằm ngoài các tháng yêu cầu và xử lý tổng null", () => {
    const points = buildTrend(
      [
        { date: new Date("2025-01-01T00:00:00Z"), type: "INCOME", _sum: { amount: 999 } },
        { date: new Date("2026-10-02T00:00:00Z"), type: "INCOME", _sum: { amount: null } },
      ],
      months,
    );
    expect(points.every((p) => p.income === 0 && p.expense === 0)).toBe(true);
  });
});
