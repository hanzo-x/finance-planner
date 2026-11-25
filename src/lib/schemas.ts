import * as z from "zod";
import {
  BUDGET_CATEGORIES,
  CATEGORIES,
  MAX_AMOUNT,
  PRIORITIES,
  TRANSACTION_TYPES,
  type CategoryKey,
  type TransactionTypeKey,
} from "./constants";
import { PERIODS, parseDateInput, startOfTodayVn, type Period } from "./dates";
import { parseVnd } from "./money";
import { startDateError } from "./recurring";

export const amountField = z
  .string({ error: "Nhập số tiền" })
  .trim()
  .min(1, { error: "Nhập số tiền" })
  .transform((value, ctx) => {
    const amount = parseVnd(value);
    if (amount === null) {
      ctx.addIssue({
        code: "custom",
        message: "Số tiền chỉ gồm chữ số, ví dụ 50000 hoặc 50.000",
      });
      return z.NEVER;
    }
    return amount;
  })
  .pipe(
    z
      .number()
      .int({ error: "Số tiền phải là số nguyên" })
      .positive({ error: "Số tiền phải lớn hơn 0" })
      .max(MAX_AMOUNT, { error: "Số tiền quá lớn (tối đa 2 tỷ đồng)" }),
  );

export const dateField = z
  .string({ error: "Chọn ngày" })
  .trim()
  .transform((value, ctx) => {
    const date = parseDateInput(value);
    if (!date) {
      ctx.addIssue({ code: "custom", message: "Ngày không hợp lệ" });
      return z.NEVER;
    }
    return date;
  });

const descriptionField = z
  .string({ error: "Nhập mô tả" })
  .trim()
  .min(1, { error: "Nhập mô tả" })
  .max(120, { error: "Mô tả tối đa 120 ký tự" });

export const transactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { error: "Chọn loại giao dịch" }),
  amount: amountField,
  description: descriptionField,
  category: z.enum(CATEGORIES, { error: "Chọn danh mục" }),
  date: dateField,
});
export type TransactionInput = z.output<typeof transactionSchema>;

const dayOfMonthField = z
  .string({ error: "Chọn ngày trong tháng" })
  .trim()
  .regex(/^\d{1,2}$/, { error: "Chọn ngày trong tháng" })
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(1, { error: "Ngày phải từ 1 đến 31" })
      .max(31, { error: "Ngày phải từ 1 đến 31" }),
  );

const recurringStartDateField = dateField.superRefine((date, ctx) => {
  const message = startDateError(date, startOfTodayVn());
  if (message) ctx.addIssue({ code: "custom", message });
});

export const recurringSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { error: "Chọn loại giao dịch" }),
  amount: amountField,
  description: descriptionField,
  category: z.enum(CATEGORIES, { error: "Chọn danh mục" }),
  dayOfMonth: dayOfMonthField,
  startDate: recurringStartDateField,
});
export type RecurringInput = z.output<typeof recurringSchema>;

export const recurringUpdateSchema = recurringSchema.omit({ dayOfMonth: true, startDate: true });

export const wishlistSchema = z.object({
  name: z
    .string({ error: "Nhập tên món đồ" })
    .trim()
    .min(1, { error: "Nhập tên món đồ" })
    .max(80, { error: "Tên tối đa 80 ký tự" }),
  cost: amountField,
  priority: z.enum(PRIORITIES, { error: "Chọn mức ưu tiên" }),
});
export type WishlistInput = z.output<typeof wishlistSchema>;

export const budgetSchema = z.object({
  category: z.enum(BUDGET_CATEGORIES, { error: "Chọn danh mục" }),
  limit: amountField,
});

export const idSchema = z.object({
  id: z.string({ error: "Thiếu mã bản ghi" }).min(1, { error: "Thiếu mã bản ghi" }),
});

const emailField = z
  .string({ error: "Nhập email" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Email không hợp lệ" }));

export const signUpSchema = z.object({
  name: z
    .string({ error: "Nhập tên hiển thị" })
    .trim()
    .min(2, { error: "Tên tối thiểu 2 ký tự" })
    .max(50, { error: "Tên tối đa 50 ký tự" }),
  email: emailField,
  password: z
    .string({ error: "Nhập mật khẩu" })
    .min(8, { error: "Mật khẩu tối thiểu 8 ký tự" })
    .max(128, { error: "Mật khẩu tối đa 128 ký tự" }),
});

export const signInSchema = z.object({
  email: emailField,
  password: z.string({ error: "Nhập mật khẩu" }).min(1, { error: "Nhập mật khẩu" }),
});

export type Filters = {
  period: Period;
  category?: CategoryKey;
  type?: TransactionTypeKey;
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFilters(searchParams: SearchParams): Filters {
  const period = z.enum(PERIODS).safeParse(first(searchParams.period));
  const category = z.enum(CATEGORIES).safeParse(first(searchParams.category));
  const type = z.enum(TRANSACTION_TYPES).safeParse(first(searchParams.type));
  return {
    period: period.success ? period.data : "all",
    category: category.success ? category.data : undefined,
    type: type.success ? type.data : undefined,
  };
}

export function formDataToObject(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}
