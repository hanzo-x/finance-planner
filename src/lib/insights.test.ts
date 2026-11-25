import { describe, expect, it } from "vitest";
import { monthInsights } from "./insights";

describe("monthInsights", () => {
  it("chưa có giao dịch -> một câu nhắc thêm dữ liệu", () => {
    const result = monthInsights({ expenseByCategory: [], income: 0, expense: 0, previousExpenseSamePeriod: 0 });
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("chưa có giao dịch");
  });

  it("nêu danh mục chi nhiều nhất kèm phần trăm", () => {
    const result = monthInsights({
      expenseByCategory: [
        { category: "FOOD", total: 600_000 },
        { category: "TRANSPORT", total: 200_000 },
        { category: "SHOPPING", total: 200_000 },
      ],
      income: 0,
      expense: 1_000_000,
      previousExpenseSamePeriod: 0,
    });
    expect(result[0]).toBe("Bạn chi nhiều nhất cho Ăn uống (60% tổng chi).");
  });

  it("so với cùng kỳ tháng trước: tăng, giảm, gần bằng", () => {
    const base = { expenseByCategory: [{ category: "FOOD" as const, total: 1 }], income: 0 };
    const up = monthInsights({ ...base, expense: 1_230_000, previousExpenseSamePeriod: 1_000_000 });
    expect(up).toContain("Chi tiêu tăng 23% so với cùng kỳ tháng trước.");

    const down = monthInsights({ ...base, expense: 500_000, previousExpenseSamePeriod: 1_000_000 });
    expect(down.join(" ")).toContain("giảm 50%");

    const same = monthInsights({ ...base, expense: 1_020_000, previousExpenseSamePeriod: 1_000_000 });
    expect(same).toContain("Chi tiêu gần bằng cùng kỳ tháng trước.");
  });

  it("không so sánh khi tháng trước không có chi tiêu (tránh chia cho 0)", () => {
    const result = monthInsights({
      expenseByCategory: [{ category: "FOOD", total: 100 }],
      income: 0,
      expense: 100,
      previousExpenseSamePeriod: 0,
    });
    expect(result.some((line) => line.includes("so với"))).toBe(false);
  });

  it("tỉ lệ giữ lại được: làm tròn xuống; chi vượt thu thì báo số tiền vượt", () => {
    const kept = monthInsights({ expenseByCategory: [], income: 10_000_000, expense: 3_333_333, previousExpenseSamePeriod: 0 });
    expect(kept).toContain("Bạn giữ lại được 66% thu nhập tháng này.");

    const over = monthInsights({
      expenseByCategory: [{ category: "SHOPPING", total: 3_000_000 }],
      income: 1_000_000,
      expense: 3_000_000,
      previousExpenseSamePeriod: 0,
    });
    expect(over.join(" ")).toMatch(/chi vượt thu 2\.000\.000/);
  });

  it("có chi nhưng chưa có thu -> báo chưa ghi khoản thu", () => {
    const result = monthInsights({
      expenseByCategory: [{ category: "FOOD", total: 50_000 }],
      income: 0,
      expense: 50_000,
      previousExpenseSamePeriod: 0,
    });
    expect(result).toContain("Tháng này chưa có khoản thu nào được ghi lại.");
  });
});
