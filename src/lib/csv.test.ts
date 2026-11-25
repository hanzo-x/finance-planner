import { describe, expect, it } from "vitest";
import { parseCsv, parseTransactionsCsv, sanitizeCell, transactionsToCsv } from "./csv";

const HEADER = "date,type,category,amount,description";

describe("transactionsToCsv", () => {
  it("có dòng tiêu đề và BOM để Excel đọc đúng tiếng Việt", () => {
    const csv = transactionsToCsv([]);
    expect(csv.startsWith("﻿" + HEADER)).toBe(true);
  });

  it("bọc ô có dấu phẩy / nháy kép trong dấu nháy", () => {
    const csv = transactionsToCsv([
      {
        date: new Date("2026-11-25T00:00:00Z"),
        type: "EXPENSE",
        category: "FOOD",
        amount: 45000,
        description: 'Cơm, "tấm" sườn',
      },
    ]);
    expect(csv).toContain('2026-11-25,EXPENSE,FOOD,45000,"Cơm, ""tấm"" sườn"');
  });

  it("chống CSV injection: ô bắt đầu bằng = + - @ được thêm dấu '", () => {
    expect(sanitizeCell("=SUM(A1:A9)")).toBe("'=SUM(A1:A9)");
    expect(sanitizeCell("@cmd")).toBe("'@cmd");
    expect(sanitizeCell("Bình thường")).toBe("Bình thường");
  });
});

describe("parseCsv", () => {
  it("đọc ô có dấu phẩy, dấu nháy và xuống dòng bên trong", () => {
    const rows = parseCsv('a,"b,c","d ""e"" f"\r\n1,"dòng 1\ndòng 2",3\r\n');
    expect(rows).toEqual([
      ["a", "b,c", 'd "e" f'],
      ["1", "dòng 1\ndòng 2", "3"],
    ]);
  });

  it("bỏ dòng trống và BOM", () => {
    expect(parseCsv("﻿a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("parseTransactionsCsv", () => {
  it("nhập được file hợp lệ", () => {
    const result = parseTransactionsCsv(`${HEADER}\n2026-11-25,EXPENSE,FOOD,45000,Bún bò\n2026-11-01,INCOME,SALARY,12000000,Lương`);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].amount).toBe(45000);
    expect(result.rows[1].category).toBe("SALARY");
  });

  it("chấp nhận tên tiếng Việt và ngày dd/mm/yyyy", () => {
    const result = parseTransactionsCsv(`${HEADER}\n25/11/2026,Chi tiêu,Ăn uống,45.000,Phở`);
    expect(result.errors).toEqual([]);
    expect(result.rows[0].type).toBe("EXPENSE");
    expect(result.rows[0].category).toBe("FOOD");
    expect(result.rows[0].date.toISOString()).toBe("2026-11-25T00:00:00.000Z");
  });

  it("sai tiêu đề -> báo lỗi dòng 1", () => {
    const result = parseTransactionsCsv("ngay,loai\n1,2");
    expect(result.rows).toEqual([]);
    expect(result.errors[0].line).toBe(1);
  });

  it("báo đúng số dòng bị lỗi", () => {
    const result = parseTransactionsCsv(
      `${HEADER}\n2026-11-25,EXPENSE,FOOD,45000,OK\n2026-11-25,EXPENSE,FOOD,abc,Sai tiền\n2026-11-25,KHAC,FOOD,100,Sai loại`,
    );
    expect(result.errors.map((e) => e.line)).toEqual([3, 4]);
  });

  it("dòng thiếu cột bị từ chối", () => {
    const result = parseTransactionsCsv(`${HEADER}\n2026-11-25,EXPENSE,FOOD`);
    expect(result.errors[0].message).toContain("5 cột");
  });

  it("vượt số dòng tối đa bị từ chối", () => {
    const lines = Array.from({ length: 4 }, () => "2026-11-25,EXPENSE,FOOD,1000,x").join("\n");
    const result = parseTransactionsCsv(`${HEADER}\n${lines}`, 3);
    expect(result.rows).toEqual([]);
    expect(result.errors[0].message).toContain("Tối đa 3");
  });

  it("xuất rồi nhập lại cho kết quả giống ban đầu (kể cả mô tả có dấu phẩy và ký tự đặc biệt)", () => {
    const original = [
      {
        date: new Date("2026-05-09T00:00:00Z"),
        type: "EXPENSE" as const,
        category: "SHOPPING" as const,
        amount: 750000,
        description: "=Áo, quần",
      },
    ];
    const result = parseTransactionsCsv(transactionsToCsv(original));
    expect(result.errors).toEqual([]);
    expect(result.rows[0]).toMatchObject({ amount: 750000, description: "=Áo, quần", category: "SHOPPING" });
  });
});
