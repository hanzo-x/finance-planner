import { describe, expect, it } from "vitest";
import * as z from "zod";
import {
  formDataToObject,
  parseFilters,
  transactionSchema,
} from "./schemas";

const validTransaction = {
  type: "EXPENSE",
  amount: "45000",
  description: "Bún bò",
  category: "FOOD",
  date: "2026-11-25",
};

function errorsOf(schema: z.ZodType, input: unknown): Record<string, string[] | undefined> {
  const result = schema.safeParse(input);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("transactionSchema", () => {
  it("nhận dữ liệu hợp lệ và đổi kiểu: amount -> số, date -> Date", () => {
    const result = transactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(45000);
      expect(result.data.date.toISOString()).toBe("2026-11-25T00:00:00.000Z");
    }
  });

  it("số tiền = 0 hoặc quá lớn bị từ chối", () => {
    expect(errorsOf(transactionSchema, { ...validTransaction, amount: "0" }).amount).toBeDefined();
    expect(
      errorsOf(transactionSchema, { ...validTransaction, amount: "3000000000" }).amount,
    ).toBeDefined();
  });

  it("số tiền không phải số bị từ chối với thông báo tiếng Việt", () => {
    const errors = errorsOf(transactionSchema, { ...validTransaction, amount: "abc" });
    expect(errors.amount?.[0]).toContain("chữ số");
  });

  it("mô tả: rỗng bị từ chối, 120 ký tự được, 121 ký tự bị từ chối", () => {
    expect(errorsOf(transactionSchema, { ...validTransaction, description: "   " }).description).toBeDefined();
    expect(
      errorsOf(transactionSchema, { ...validTransaction, description: "a".repeat(120) }).description,
    ).toBeUndefined();
    expect(
      errorsOf(transactionSchema, { ...validTransaction, description: "a".repeat(121) }).description,
    ).toBeDefined();
  });

  it("loại và danh mục phải nằm trong danh sách cho phép", () => {
    const errors = errorsOf(transactionSchema, { ...validTransaction, type: "HACK", category: "XYZ" });
    expect(errors.type).toBeDefined();
    expect(errors.category).toBeDefined();
  });

  it("ngày không tồn tại bị từ chối", () => {
    expect(errorsOf(transactionSchema, { ...validTransaction, date: "2026-02-30" }).date).toBeDefined();
  });

  it("thiếu hẳn một trường -> báo lỗi đúng trường đó", () => {
    const { description: _omit, ...withoutDescription } = validTransaction;
    void _omit;
    expect(errorsOf(transactionSchema, withoutDescription).description).toBeDefined();
  });
});

describe("parseFilters (bộ lọc trên URL)", () => {
  it("mặc định là 'Tất cả', không lọc danh mục/loại", () => {
    expect(parseFilters({})).toEqual({ period: "all", category: undefined, type: undefined });
  });

  it("đọc giá trị hợp lệ", () => {
    expect(parseFilters({ period: "last", category: "FOOD", type: "EXPENSE" })).toEqual({
      period: "last",
      category: "FOOD",
      type: "EXPENSE",
    });
  });

  it("giá trị bậy trên URL bị bỏ qua, không gây lỗi", () => {
    expect(parseFilters({ period: "abc", category: "'; DROP TABLE", type: "x" })).toEqual({
      period: "all",
      category: undefined,
      type: undefined,
    });
  });

  it("tham số lặp lại (?period=this&period=last) lấy giá trị đầu", () => {
    expect(parseFilters({ period: ["this", "last"] }).period).toBe("this");
  });
});

describe("formDataToObject", () => {
  it("chỉ giữ giá trị chữ, bỏ file", () => {
    const formData = new FormData();
    formData.append("name", "An");
    formData.append("avatar", new File(["x"], "a.png"));
    expect(formDataToObject(formData)).toEqual({ name: "An" });
  });
});
