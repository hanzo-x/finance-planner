import { transactionsToCsv } from "@/lib/csv";
import { getCurrentUser } from "@/lib/dal";
import { todayInputValue } from "@/lib/dates";
import { getFilteredTransactions } from "@/lib/queries";
import { parseFilters } from "@/lib/schemas";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const rows = await getFilteredTransactions(user.id, parseFilters(params));

  return new Response(transactionsToCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="giao-dich-${todayInputValue()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
