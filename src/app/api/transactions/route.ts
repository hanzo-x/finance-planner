import { getCurrentUser } from "@/lib/dal";
import { getFilteredTransactions } from "@/lib/queries";
import { parseFilters } from "@/lib/schemas";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const transactions = await getFilteredTransactions(user.id, parseFilters(params));
  return Response.json({ count: transactions.length, transactions });
}
