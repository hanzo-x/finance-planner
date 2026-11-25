import * as z from "zod";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  TRANSACTION_TYPES,
  TYPE_LABELS,
  type CategoryKey,
  type TransactionTypeKey,
} from "./constants";
import { toDateInputValue } from "./dates";
import { transactionSchema, type TransactionInput } from "./schemas";

export const CSV_HEADER = ["date", "type", "category", "amount", "description"] as const;
export const CSV_MAX_ROWS = 1000;
export const CSV_MAX_BYTES = 1024 * 1024;

type ExportRow = {
  date: Date;
  type: TransactionTypeKey;
  category: CategoryKey;
  amount: number;
  description: string;
};

export function sanitizeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function unsanitizeCell(value: string): string {
  return /^'[=+\-@\t\r]/.test(value) ? value.slice(1) : value;
}

function escapeCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function transactionsToCsv(rows: ExportRow[]): string {
  const lines = [CSV_HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        toDateInputValue(r.date),
        r.type,
        r.category,
        String(r.amount),
        escapeCell(sanitizeCell(r.description)),
      ].join(","),
    );
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

const CATEGORY_LOOKUP = new Map<string, CategoryKey>();
for (const key of CATEGORIES) {
  CATEGORY_LOOKUP.set(normalizeKey(key), key);
  CATEGORY_LOOKUP.set(normalizeKey(CATEGORY_LABELS[key]), key);
}
const TYPE_LOOKUP = new Map<string, TransactionTypeKey>();
for (const key of TRANSACTION_TYPES) {
  TYPE_LOOKUP.set(normalizeKey(key), key);
  TYPE_LOOKUP.set(normalizeKey(TYPE_LABELS[key]), key);
}

function normalizeDate(value: string): string {
  const text = value.trim();
  const vn = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (vn) return `${vn[3]}-${vn[2].padStart(2, "0")}-${vn[1].padStart(2, "0")}`;
  return text;
}

export type CsvImportResult = {
  rows: TransactionInput[];
  errors: { line: number; message: string }[];
};

export function parseTransactionsCsv(
  text: string,
  maxRows: number = CSV_MAX_ROWS,
): CsvImportResult {
  const table = parseCsv(text);
  const result: CsvImportResult = { rows: [], errors: [] };

  if (table.length === 0) {
    result.errors.push({ line: 1, message: "File rỗng" });
    return result;
  }

  const header = table[0].map((h) => h.trim().toLowerCase());
  const headerOk =
    header.length === CSV_HEADER.length && CSV_HEADER.every((h, i) => h === header[i]);
  if (!headerOk) {
    result.errors.push({
      line: 1,
      message: `Dòng đầu phải là: ${CSV_HEADER.join(",")}`,
    });
    return result;
  }

  const body = table.slice(1);
  if (body.length === 0) {
    result.errors.push({ line: 2, message: "File không có dòng dữ liệu nào" });
    return result;
  }
  if (body.length > maxRows) {
    result.errors.push({ line: 1, message: `Tối đa ${maxRows} dòng mỗi lần nhập` });
    return result;
  }

  body.forEach((cells, index) => {
    const line = index + 2;
    if (cells.length !== CSV_HEADER.length) {
      result.errors.push({ line, message: `Cần đúng ${CSV_HEADER.length} cột` });
      return;
    }
    const [date, type, category, amount, description] = cells;
    const parsed = transactionSchema.safeParse({
      date: normalizeDate(date),
      type: TYPE_LOOKUP.get(normalizeKey(type)),
      category: CATEGORY_LOOKUP.get(normalizeKey(category)),
      amount,
      description: unsanitizeCell(description),
    });
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors;
      const firstMessage = Object.values(fieldErrors).flat()[0] ?? "Dữ liệu không hợp lệ";
      result.errors.push({ line, message: firstMessage });
      return;
    }
    result.rows.push(parsed.data);
  });

  return result;
}
