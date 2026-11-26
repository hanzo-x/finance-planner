import type { Metadata } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { CsvTools } from "@/components/csv-tools";
import { DeleteDialog } from "@/components/delete-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageThumb } from "@/components/page-thumb";
import { TransactionFilters } from "@/components/transaction-filters";
import { TransactionFormDialog, type TransactionDTO } from "@/components/transaction-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatDateVi, toDateInputValue } from "@/lib/dates";
import { formatVnd } from "@/lib/money";
import { buildTransactionWhere, getFilteredTransactions, getTotals } from "@/lib/queries";
import { syncRecurring } from "@/lib/recurring-service";
import { parseFilters } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Giao dịch" };

export default async function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  const user = await requireUser();
  await syncRecurring(user.id);
  const params = await searchParams;
  const filters = parseFilters(params);
  const now = new Date();

  const [transactions, totals] = await Promise.all([
    getFilteredTransactions(user.id, filters, now),
    getTotals(buildTransactionWhere(user.id, filters, now)),
  ]);

  const exportParams = new URLSearchParams();
  if (filters.period !== "all") exportParams.set("period", filters.period);
  if (filters.category) exportParams.set("category", filters.category);
  if (filters.type) exportParams.set("type", filters.type);
  const exportQuery = exportParams.size > 0 ? `?${exportParams.toString()}` : "";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PageThumb src="/images/feature-transactions.png" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Giao dịch</h1>
            <p className="text-sm text-muted-foreground">
              {transactions.length} giao dịch khớp bộ lọc
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CsvTools exportQuery={exportQuery} />
          <TransactionFormDialog>
            <Button>
              <Plus aria-hidden="true" /> Thêm giao dịch
            </Button>
          </TransactionFormDialog>
        </div>
      </div>

      <TransactionFilters {...filters} />

      <dl className="grid grid-cols-3 gap-3 rounded-xl border bg-card p-4 text-sm">
        <div>
          <dt className="text-muted-foreground">Tổng thu</dt>
          <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatVnd(totals.income)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tổng chi</dt>
          <dd className="font-semibold tabular-nums text-rose-700 dark:text-rose-400">
            {formatVnd(totals.expense)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Chênh lệch</dt>
          <dd className="font-semibold tabular-nums">{formatVnd(totals.balance)}</dd>
        </div>
      </dl>

      {transactions.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            image="/images/empty-transactions.png"
            as="h2"
            title="Không có giao dịch nào"
            description="Thử đổi bộ lọc, hoặc thêm giao dịch mới."
          />
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[40rem] text-sm">
            <caption className="sr-only">Danh sách giao dịch</caption>
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Ngày</th>
                <th scope="col" className="px-4 py-3 font-medium">Mô tả</th>
                <th scope="col" className="px-4 py-3 font-medium">Danh mục</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Số tiền</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const dto: TransactionDTO = {
                  id: t.id,
                  type: t.type,
                  amount: t.amount,
                  description: t.description,
                  category: t.category,
                  date: toDateInputValue(t.date),
                };
                return (
                  <tr key={t.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">{formatDateVi(t.date)}</td>
                    <td className="max-w-64 px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{t.description}</span>
                        {t.recurringId ? (
                          <Badge variant="outline" className="shrink-0">
                            Định kỳ
                          </Badge>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{CATEGORY_LABELS[t.category]}</Badge>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums",
                        t.type === "INCOME"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      <span className="sr-only">{t.type === "INCOME" ? "Thu" : "Chi"} </span>
                      {t.type === "INCOME" ? "+" : "−"} {formatVnd(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <TransactionFormDialog transaction={dto}>
                          <Button variant="ghost" size="icon" aria-label={`Sửa giao dịch ${t.description}`}>
                            <Pencil aria-hidden="true" />
                          </Button>
                        </TransactionFormDialog>
                        <DeleteDialog
                          kind="transaction"
                          id={t.id}
                          title="Xoá giao dịch này?"
                          description={`Giao dịch “${t.description}” (${formatVnd(t.amount)}) sẽ bị xoá và không khôi phục được.`}
                        >
                          <Button variant="ghost" size="icon" aria-label={`Xoá giao dịch ${t.description}`}>
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </DeleteDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {transactions.length >= 500 ? (
        <p className="text-sm text-muted-foreground">
          Chỉ hiển thị 500 giao dịch mới nhất. Hãy dùng bộ lọc để thu hẹp kết quả.
        </p>
      ) : null}
    </div>
  );
}
