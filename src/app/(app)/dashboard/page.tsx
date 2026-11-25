import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { BudgetMeter } from "@/components/budget-meter";
import { EmptyState } from "@/components/empty-state";
import { ExpensePieChart } from "@/components/expense-pie-chart";
import { MonthInsights } from "@/components/month-insights";
import { SavingsProgress } from "@/components/savings-progress";
import { TransactionFormDialog } from "@/components/transaction-form-dialog";
import { TrendChart } from "@/components/trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/dal";
import { CATEGORY_LABELS } from "@/lib/constants";
import { daysBetween, formatDateVi, previousMonthSamePeriod, startOfTodayVn } from "@/lib/dates";
import { forecastHint } from "@/lib/forecast";
import { monthInsights } from "@/lib/insights";
import { formatVnd } from "@/lib/money";
import {
  buildTransactionWhere,
  getBalanceTotals,
  getBudgetRows,
  getExpenseTotal,
  getMonthExpenseGroups,
  getMonthlyTrend,
  getRecentTransactions,
  getRecurringRules,
  getSavingsTrend,
  getTotals,
  getWishlist,
} from "@/lib/queries";
import { nextOccurrence } from "@/lib/recurring";
import { syncRecurring } from "@/lib/recurring-service";
import { pieDataFromGroups } from "@/lib/summary";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tổng quan" };

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  await syncRecurring(user.id);

  const [totals, monthTotals, monthGroups, wishlist, budgetRows, recent, trend, savings, previousExpense, rules] =
    await Promise.all([
      getBalanceTotals(user.id),
      getTotals(buildTransactionWhere(user.id, { period: "this" }, now)),
      getMonthExpenseGroups(user.id, now),
      getWishlist(user.id),
      getBudgetRows(user.id, now),
      getRecentTransactions(user.id, 5),
      getMonthlyTrend(user.id, now),
      getSavingsTrend(user.id, now),
      getExpenseTotal(user.id, previousMonthSamePeriod(now)),
      getRecurringRules(user.id),
    ]);

  const today = startOfTodayVn(now);
  const upcoming = rules
    .filter((rule) => rule.active)
    .map((rule) => ({ rule, date: nextOccurrence(rule, today) }))
    .filter((item): item is { rule: (typeof rules)[number]; date: Date } => item.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const pie = pieDataFromGroups(monthGroups);
  const insights = monthInsights({
    expenseByCategory: monthGroups.map((g) => ({ category: g.category, total: g._sum.amount ?? 0 })),
    income: monthTotals.income,
    expense: monthTotals.expense,
    previousExpenseSamePeriod: previousExpense,
  });
  const hasTrend = trend.some((point) => point.income > 0 || point.expense > 0);

  const budgets = budgetRows.filter((row) => row.limit !== null);
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

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Thu – chi 6 tháng gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTrend ? (
              <TrendChart data={trend} />
            ) : (
              <EmptyState
                image="/images/empty-chart.png"
                title="Chưa có dữ liệu để vẽ biểu đồ"
                description="Thêm vài giao dịch để xem thu nhập và chi tiêu thay đổi qua từng tháng."
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Nhận xét tháng này</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthInsights lines={insights} />
            {upcoming.length > 0 ? (
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Sắp tới (định kỳ)</h3>
                  <Link href="/recurring" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                    Quản lý
                  </Link>
                </div>
                <ul className="mt-2 divide-y text-sm">
                  {upcoming.map(({ rule, date }) => (
                    <li key={rule.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{rule.description}</span>
                        <span className="block text-xs text-muted-foreground">
                          {formatDateVi(date)} · còn {daysBetween(today, date)} ngày
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 font-semibold tabular-nums",
                          rule.type === "INCOME"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400",
                        )}
                      >
                        {rule.type === "INCOME" ? "+" : "−"} {formatVnd(rule.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Chi tiêu tháng này theo danh mục</CardTitle>
          </CardHeader>
          <CardContent>
            {pie.length > 0 ? (
              <ExpensePieChart data={pie} />
            ) : (
              <EmptyState
                image="/images/empty-chart.png"
                title="Tháng này chưa có khoản chi nào"
                description="Thêm giao dịch chi tiêu để xem biểu đồ phân bổ theo danh mục."
              />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Tiến độ wishlist</CardTitle>
            <Link href="/wishlist" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="grid gap-5">
            {wishlist.length > 0 ? (
              wishlist
                .slice(0, 4)
                .map((item) => (
                  <SavingsProgress
                    key={item.id}
                    name={item.name}
                    cost={item.cost}
                    balance={totals.balance}
                    hint={forecastHint({ balance: totals.balance, cost: item.cost, ...savings })}
                  />
                ))
            ) : (
              <EmptyState
                image="/images/empty-wishlist.png"
                title="Chưa có món đồ mong muốn"
                description="Thêm món đồ bạn muốn mua để theo dõi tiến độ tiết kiệm."
              >
                <Link href="/wishlist" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Tới Wishlist
                </Link>
              </EmptyState>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Ngân sách tháng này</CardTitle>
            <Link href="/budgets" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Quản lý
            </Link>
          </CardHeader>
          <CardContent className="grid gap-5">
            {budgets.length > 0 ? (
              budgets.map((row) => (
                <BudgetMeter
                  key={row.category}
                  label={CATEGORY_LABELS[row.category]}
                  spent={row.spent}
                  limit={row.limit!}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa đặt ngân sách nào. Đặt hạn mức cho từng danh mục để được cảnh báo khi chi gần hết.
              </p>
            )}
          </CardContent>
        </Card>

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
                        {t.recurringId ? <Badge variant="outline">Định kỳ</Badge> : null}
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
              <EmptyState
                image="/images/empty-transactions.png"
                title="Chưa có giao dịch nào"
                description="Bấm “Thêm giao dịch” để ghi khoản thu hoặc chi đầu tiên."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
