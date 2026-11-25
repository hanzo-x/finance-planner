import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/dal", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/queries", () => ({ getFilteredTransactions: vi.fn() }));

import { getCurrentUser } from "@/lib/dal";
import { getFilteredTransactions } from "@/lib/queries";
import { GET } from "./route";

const mockedUser = vi.mocked(getCurrentUser);
const mockedQuery = vi.mocked(getFilteredTransactions);

describe("GET /api/transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("trả 401 khi chưa đăng nhập và KHÔNG truy vấn database", async () => {
    mockedUser.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/transactions"));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Chưa đăng nhập" });
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it("đã đăng nhập: chỉ truy vấn theo userId của session và áp dụng bộ lọc từ URL", async () => {
    mockedUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    mockedQuery.mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/transactions?period=this&category=FOOD&userId=hacker"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 0, transactions: [] });
    expect(mockedQuery).toHaveBeenCalledWith("user-1", {
      period: "this",
      category: "FOOD",
      type: undefined,
    });
  });
});
