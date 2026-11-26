import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatDateVi } from "@/lib/dates";
import { formatVnd } from "@/lib/money";
import { getBalanceTotals, getMonthTotals, getRecentTransactions } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tổng quan" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [totals, monthTotals, recent] = await Promise.all([
    getBalanceTotals(user.id),
    getMonthTotals(user.id),
    getRecentTransactions(user.id, 5),
  ]);
  const hasData = recent.length > 0;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">Xin chào {user.name}, đây là tình hình tài chính của bạn.</p>
        </div>
        <TransactionFormDialog>
          <Button>
            <Plus aria-hidden="true" /> Thêm giao dịch
          </Button>
        </TransactionFormDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardDescription>Số dư hiện tại (tổng thu − tổng chi)</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p
              className={cn(
                "text-4xl font-bold tracking-tight tabular-nums sm:text-5xl",
                totals.balance < 0 && "text-rose-700 dark:text-rose-400",
              )}
              aria-label={`Số dư hiện tại: ${formatVnd(totals.balance)}`}
            >
              {formatVnd(totals.balance)}
            </p>
            <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
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
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Tháng này</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thu nhập</span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatVnd(monthTotals.income)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chi tiêu</span>
              <span className="font-semibold tabular-nums text-rose-700 dark:text-rose-400">
                {formatVnd(monthTotals.expense)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Chênh lệch</span>
              <span className="font-semibold tabular-nums">{formatVnd(monthTotals.balance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Giao dịch gần đây</CardTitle>
            <Link href="/transactions" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <ul className="divide-y">
                {recent.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.description}</p>
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        {formatDateVi(t.date)} <Badge>{CATEGORY_LABELS[t.category]}</Badge>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-semibold tabular-nums",
                        t.type === "INCOME"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400",
                      )}
                    >
                      {t.type === "INCOME" ? "+" : "−"} {formatVnd(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Chưa có giao dịch nào. Hãy chạy <code>npx prisma db seed</code> để nạp dữ liệu mẫu.
              </p>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
