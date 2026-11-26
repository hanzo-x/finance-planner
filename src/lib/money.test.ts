import { describe, expect, it } from "vitest";
import { formatCompactVnd, formatVnd, parseVnd } from "./money";

describe("parseVnd", () => {
  it("đọc số nguyên thường", () => {
    expect(parseVnd("50000")).toBe(50000);
  });

  it("đọc số có dấu chấm hoặc dấu phẩy phân cách hàng nghìn", () => {
    expect(parseVnd("50.000")).toBe(50000);
    expect(parseVnd("1,500,000")).toBe(1_500_000);
    expect(parseVnd("12.345.678")).toBe(12_345_678);
  });

  it("bỏ khoảng trắng thừa", () => {
    expect(parseVnd("  2 000 000 ")).toBe(2_000_000);
  });

  it("từ chối chữ, số thập phân, số âm và chuỗi rỗng", () => {
    expect(parseVnd("abc")).toBeNull();
    expect(parseVnd("1.5")).toBeNull();
    expect(parseVnd("-100")).toBeNull();
    expect(parseVnd("")).toBeNull();
  });

  it("từ chối dấu phân cách sai vị trí", () => {
    expect(parseVnd("12.34.5")).toBeNull();
    expect(parseVnd("1.000.00")).toBeNull();
  });
});

describe("formatVnd", () => {
  it("có dấu chấm ngăn cách hàng nghìn và ký hiệu ₫", () => {
    const text = formatVnd(1_500_000);
    expect(text).toContain("1.500.000");
    expect(text).toContain("₫");
  });

  it("hiển thị số âm", () => {
    expect(formatVnd(-45_000)).toContain("45.000");
    expect(formatVnd(-45_000)).toMatch(/^-|−/);
  });
});

describe("formatCompactVnd", () => {
  it("rút gọn cho trục biểu đồ: nghìn (k), triệu (tr), tỷ", () => {
    expect(formatCompactVnd(0)).toBe("0");
    expect(formatCompactVnd(45_000)).toBe("45k");
    expect(formatCompactVnd(1_500_000)).toBe("1,5tr");
    expect(formatCompactVnd(12_000_000)).toBe("12tr");
    expect(formatCompactVnd(2_000_000_000)).toBe("2 tỷ");
  });

  it("số âm có dấu trừ", () => {
    expect(formatCompactVnd(-1_500_000)).toBe("-1,5tr");
  });
});
