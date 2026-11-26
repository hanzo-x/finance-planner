import { describe, expect, it } from "vitest";
import {
  addDays,
  daysBetween,
  previousMonthSamePeriod,
  startOfTodayVn,
  vnYearMonth,
  formatDateVi,
  getDateRange,
  parseDateInput,
  todayInputValue,
  toDateInputValue,
} from "./dates";

describe("getDateRange", () => {
  it("'this' = từ ngày 1 tháng này đến ngày 1 tháng sau", () => {
    const range = getDateRange("this", new Date("2026-11-25T10:00:00Z"));
    expect(range?.gte.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(range?.lt.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("'last' = tháng trước", () => {
    const range = getDateRange("last", new Date("2026-11-25T10:00:00Z"));
    expect(range?.gte.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(range?.lt.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("'last' của tháng 1 phải quay về tháng 12 NĂM TRƯỚC", () => {
    const range = getDateRange("last", new Date("2027-01-15T10:00:00Z"));
    expect(range?.gte.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(range?.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("'this' của tháng 12 kết thúc ở ngày 1/1 năm sau", () => {
    const range = getDateRange("this", new Date("2026-12-10T10:00:00Z"));
    expect(range?.gte.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(range?.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("'all' không giới hạn thời gian", () => {
    expect(getDateRange("all", new Date())).toBeNull();
  });

  it("tính theo giờ Việt Nam: 03:00 ngày 1/12 (VN) vẫn còn là 20:00 ngày 30/11 (UTC)", () => {
    const range = getDateRange("this", new Date("2026-11-30T20:00:00Z"));
    expect(range?.gte.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("23:59 ngày 30/11 giờ VN vẫn thuộc tháng 11", () => {
    const range = getDateRange("this", new Date("2026-11-30T16:59:00Z"));
    expect(range?.gte.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });
});

describe("parseDateInput", () => {
  it("đọc ngày hợp lệ thành 00:00 UTC", () => {
    expect(parseDateInput("2026-11-25")?.toISOString()).toBe("2026-11-25T00:00:00.000Z");
  });

  it("chấp nhận 29/2 của năm nhuận, từ chối năm không nhuận", () => {
    expect(parseDateInput("2028-02-29")).not.toBeNull();
    expect(parseDateInput("2027-02-29")).toBeNull();
  });

  it("từ chối ngày không tồn tại hoặc sai định dạng", () => {
    expect(parseDateInput("2026-02-30")).toBeNull();
    expect(parseDateInput("2026-13-01")).toBeNull();
    expect(parseDateInput("25/11/2026")).toBeNull();
    expect(parseDateInput("")).toBeNull();
  });
});

describe("định dạng ngày", () => {
  it("formatDateVi -> dd/mm/yyyy", () => {
    expect(formatDateVi(new Date("2026-03-07T00:00:00Z"))).toBe("07/03/2026");
  });

  it("toDateInputValue và parseDateInput đối xứng nhau", () => {
    const date = parseDateInput("2026-01-31")!;
    expect(toDateInputValue(date)).toBe("2026-01-31");
  });

  it("todayInputValue dùng giờ Việt Nam", () => {
    expect(todayInputValue(new Date("2026-11-30T20:00:00Z"))).toBe("2026-12-01");
  });
});

describe("startOfTodayVn", () => {
  it("lấy 00:00 UTC của ngày theo giờ Việt Nam", () => {
    expect(startOfTodayVn(new Date("2026-11-24T20:00:00Z")).toISOString()).toBe("2026-11-25T00:00:00.000Z");
    expect(startOfTodayVn(new Date("2026-11-25T10:00:00Z")).toISOString()).toBe("2026-11-25T00:00:00.000Z");
  });
});

describe("addDays / daysBetween", () => {
  it("cộng ngày qua cuối tháng và cuối năm", () => {
    expect(addDays(new Date(Date.UTC(2026, 11, 30)), 3).toISOString().slice(0, 10)).toBe("2027-01-02");
    expect(addDays(new Date(Date.UTC(2026, 2, 1)), -1).toISOString().slice(0, 10)).toBe("2026-02-28");
  });

  it("đếm số ngày giữa hai mốc", () => {
    expect(daysBetween(new Date(Date.UTC(2026, 10, 1)), new Date(Date.UTC(2026, 10, 25)))).toBe(24);
    expect(daysBetween(new Date(Date.UTC(2026, 10, 25)), new Date(Date.UTC(2026, 10, 25)))).toBe(0);
    expect(daysBetween(new Date(Date.UTC(2026, 10, 25)), new Date(Date.UTC(2026, 10, 1)))).toBe(-24);
  });
});

describe("vnYearMonth", () => {
  it("tháng/năm theo giờ Việt Nam (tháng đếm từ 0 như JavaScript: 0 = tháng 1)", () => {
    expect(vnYearMonth(new Date("2026-11-25T03:00:00Z"))).toEqual({ year: 2026, month: 10 });
    expect(vnYearMonth(new Date("2026-12-31T17:30:00Z"))).toEqual({ year: 2027, month: 0 });
  });
});

describe("previousMonthSamePeriod", () => {
  it("từ mùng 1 tháng trước đến cùng ngày (gồm cả ngày đó)", () => {
    const { gte, lt } = previousMonthSamePeriod(new Date("2026-11-25T03:00:00Z"));
    expect(gte.toISOString().slice(0, 10)).toBe("2026-10-01");
    expect(lt.toISOString().slice(0, 10)).toBe("2026-10-26");
  });

  it("hôm nay là 31 mà tháng trước chỉ có 30 ngày -> chặn ở hết tháng trước", () => {
    const { gte, lt } = previousMonthSamePeriod(new Date("2026-05-31T03:00:00Z"));
    expect(gte.toISOString().slice(0, 10)).toBe("2026-04-01");
    expect(lt.toISOString().slice(0, 10)).toBe("2026-05-01");
  });

  it("tháng 1 thì tháng trước là tháng 12 năm ngoái", () => {
    const { gte, lt } = previousMonthSamePeriod(new Date("2027-01-10T03:00:00Z"));
    expect(gte.toISOString().slice(0, 10)).toBe("2026-12-01");
    expect(lt.toISOString().slice(0, 10)).toBe("2026-12-11");
  });
});
