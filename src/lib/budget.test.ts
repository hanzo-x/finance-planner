import { describe, expect, it } from "vitest";
import { budgetLevel, budgetPercent, budgetWarningMessage, levelIncreased } from "./budget";

describe("budgetLevel", () => {
  const limit = 1_000_000;

  it("dưới 80% -> ok", () => {
    expect(budgetLevel(0, limit)).toBe("ok");
    expect(budgetLevel(799_999, limit)).toBe("ok");
  });

  it("từ 80% đến dưới 100% -> warning", () => {
    expect(budgetLevel(800_000, limit)).toBe("warning");
    expect(budgetLevel(999_999, limit)).toBe("warning");
  });

  it("từ 100% trở lên -> over", () => {
    expect(budgetLevel(1_000_000, limit)).toBe("over");
    expect(budgetLevel(2_500_000, limit)).toBe("over");
  });

  it("hạn mức không hợp lệ -> ok (không chia cho 0)", () => {
    expect(budgetLevel(500, 0)).toBe("ok");
  });
});

describe("budgetPercent", () => {
  it("có thể lớn hơn 100 khi vượt ngân sách", () => {
    expect(budgetPercent(1_500_000, 1_000_000)).toBe(150);
    expect(budgetPercent(250_000, 1_000_000)).toBe(25);
    expect(budgetPercent(0, 1_000_000)).toBe(0);
  });
});

describe("levelIncreased & budgetWarningMessage", () => {
  it("chỉ cảnh báo khi mức độ tăng lên", () => {
    expect(levelIncreased("ok", "warning")).toBe(true);
    expect(levelIncreased("warning", "over")).toBe(true);
    expect(levelIncreased("warning", "warning")).toBe(false);
    expect(levelIncreased("over", "warning")).toBe(false);
  });

  it("ok thì không có thông báo", () => {
    expect(budgetWarningMessage("Ăn uống", "ok")).toBeNull();
    expect(budgetWarningMessage("Ăn uống", "warning")).toContain("80%");
    expect(budgetWarningMessage("Ăn uống", "over")).toContain("vượt");
  });
});
