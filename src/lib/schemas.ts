import * as z from "zod";
import {
  CATEGORIES,
  MAX_AMOUNT,
  TRANSACTION_TYPES,
  type CategoryKey,
  type TransactionTypeKey,
} from "./constants";
import { PERIODS, parseDateInput, type Period } from "./dates";
import { parseVnd } from "./money";

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

export const idSchema = z.object({
  id: z.string({ error: "Thiếu mã bản ghi" }).min(1, { error: "Thiếu mã bản ghi" }),
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
