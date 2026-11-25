import { describe, expect, it } from "vitest";
import * as z from "zod";
import {
  budgetSchema,
  formDataToObject,
  parseFilters,
  recurringSchema,
  recurringUpdateSchema,
  signUpSchema,
  transactionSchema,
  wishlistSchema,
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

describe("wishlistSchema", () => {
  it("nhận dữ liệu hợp lệ", () => {
    const result = wishlistSchema.safeParse({ name: "Laptop", cost: "25.000.000", priority: "HIGH" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.cost).toBe(25_000_000);
  });

  it("từ chối tên rỗng và mức ưu tiên lạ", () => {
    const errors = errorsOf(wishlistSchema, { name: "", cost: "1000", priority: "URGENT" });
    expect(errors.name).toBeDefined();
    expect(errors.priority).toBeDefined();
  });
});

describe("budgetSchema", () => {
  it("không cho đặt ngân sách cho danh mục Lương", () => {
    expect(errorsOf(budgetSchema, { category: "SALARY", limit: "1000000" }).category).toBeDefined();
    expect(budgetSchema.safeParse({ category: "FOOD", limit: "1000000" }).success).toBe(true);
  });
});

describe("signUpSchema", () => {
  it("email sai và mật khẩu ngắn bị từ chối", () => {
    const errors = errorsOf(signUpSchema, { name: "An", email: "khong-phai-email", password: "123" });
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it("chuẩn hoá email về chữ thường", () => {
    const result = signUpSchema.safeParse({ name: "An", email: " AN@Example.com ", password: "12345678" });
    expect(result.success && result.data.email).toBe("an@example.com");
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

describe("recurringSchema", () => {
  const today = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const valid = {
    type: "EXPENSE",
    amount: "2.500.000",
    description: "Tiền trọ",
    category: "BILLS",
    dayOfMonth: "5",
    startDate: today,
  };

  it("nhận dữ liệu hợp lệ và đổi chữ thành số / ngày", () => {
    const result = recurringSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(2_500_000);
      expect(result.data.dayOfMonth).toBe(5);
      expect(result.data.startDate.toISOString().slice(0, 10)).toBe(today);
    }
  });

  it("ngày trong tháng chỉ nhận 1–31", () => {
    for (const bad of ["0", "32", "-1", "abc", "", "1.5"]) {
      expect(errorsOf(recurringSchema, { ...valid, dayOfMonth: bad }).dayOfMonth).toBeDefined();
    }
    for (const good of ["1", "15", "31"]) {
      expect(recurringSchema.safeParse({ ...valid, dayOfMonth: good }).success).toBe(true);
    }
  });

  it("ngày bắt đầu quá cũ hoặc quá xa bị từ chối", () => {
    expect(errorsOf(recurringSchema, { ...valid, startDate: "2020-01-01" }).startDate?.[0]).toMatch(/2 năm/);
    expect(errorsOf(recurringSchema, { ...valid, startDate: "2099-01-01" }).startDate?.[0]).toMatch(/1 năm/);
    expect(errorsOf(recurringSchema, { ...valid, startDate: "2026-02-30" }).startDate).toBeDefined();
  });

  it("báo lỗi ngày bắt đầu CÙNG LÚC với các lỗi khác (không đợi sửa xong lỗi khác mới hiện)", () => {
    const errors = errorsOf(recurringSchema, { ...valid, amount: "abc", description: "", startDate: "2020-01-01" });
    expect(errors.amount).toBeDefined();
    expect(errors.description).toBeDefined();
    expect(errors.startDate).toBeDefined();
  });

  it("recurringUpdateSchema bỏ qua ngày trong tháng và ngày bắt đầu (bị khoá khi sửa)", () => {
    const result = recurringUpdateSchema.safeParse({
      type: "INCOME",
      amount: "12000000",
      description: "Lương",
      category: "SALARY",
      dayOfMonth: "99",
      startDate: "2020-01-01",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(Object.keys(result.data).sort()).toEqual(["amount", "category", "description", "type"]);
  });
});
