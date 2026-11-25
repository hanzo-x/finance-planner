import { describe, expect, it } from "vitest";
import { pieDataFromGroups, totalsFromGroups } from "./summary";

describe("totalsFromGroups", () => {
  it("số dư = tổng thu − tổng chi", () => {
    const totals = totalsFromGroups([
      { type: "INCOME", _sum: { amount: 12_000_000 } },
      { type: "EXPENSE", _sum: { amount: 4_500_000 } },
    ]);
    expect(totals).toEqual({ income: 12_000_000, expense: 4_500_000, balance: 7_500_000 });
  });

  it("chưa có giao dịch nào (null) -> toàn 0", () => {
    expect(totalsFromGroups([])).toEqual({ income: 0, expense: 0, balance: 0 });
    expect(totalsFromGroups([{ type: "EXPENSE", _sum: { amount: null } }]).expense).toBe(0);
  });

  it("chi nhiều hơn thu -> số dư âm", () => {
    expect(
      totalsFromGroups([
        { type: "INCOME", _sum: { amount: 100 } },
        { type: "EXPENSE", _sum: { amount: 300 } },
      ]).balance,
    ).toBe(-200);
  });
});

describe("pieDataFromGroups", () => {
  it("sắp xếp giảm dần và tính phần trăm", () => {
    const data = pieDataFromGroups([
      { category: "FOOD", _sum: { amount: 250 } },
      { category: "BILLS", _sum: { amount: 750 } },
    ]);
    expect(data.map((d) => d.category)).toEqual(["BILLS", "FOOD"]);
    expect(data.map((d) => d.percent)).toEqual([75, 25]);
    expect(data[0].label).toBe("Hoá đơn");
  });

  it("bỏ danh mục có tổng 0 / null", () => {
    const data = pieDataFromGroups([
      { category: "FOOD", _sum: { amount: 100 } },
      { category: "SHOPPING", _sum: { amount: 0 } },
      { category: "OTHER", _sum: { amount: null } },
    ]);
    expect(data).toHaveLength(1);
    expect(data[0].percent).toBe(100);
  });

  it("không có chi tiêu -> mảng rỗng", () => {
    expect(pieDataFromGroups([])).toEqual([]);
  });
});
