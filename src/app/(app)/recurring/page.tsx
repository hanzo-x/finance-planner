import type { Metadata } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/delete-dialog";
import { EmptyState } from "@/components/empty-state";
import { RecurringFormDialog, type RecurringDTO } from "@/components/recurring-form-dialog";
import { RecurringToggleButton } from "@/components/recurring-toggle-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { daysBetween, formatDateVi, startOfTodayVn } from "@/lib/dates";
import { formatVnd } from "@/lib/money";
import { getRecurringRules } from "@/lib/queries";
import { nextOccurrence } from "@/lib/recurring";
import { syncRecurring } from "@/lib/recurring-service";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Giao dịch định kỳ" };

export default async function RecurringPage() {
  const user = await requireUser();
  await syncRecurring(user.id);
  const rules = await getRecurringRules(user.id);
  const today = startOfTodayVn();

  const active = rules.filter((r) => r.active);
  const monthlyIncome = active.filter((r) => r.type === "INCOME").reduce((sum, r) => sum + r.amount, 0);
  const monthlyExpense = active.filter((r) => r.type === "EXPENSE").reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Giao dịch định kỳ</h1>
          <p className="text-sm text-muted-foreground">
            Lương, tiền trọ, internet... Khai báo một lần, app tự ghi giao dịch vào đúng ngày mỗi tháng.
          </p>
        </div>
        <RecurringFormDialog>
          <Button>
            <Plus aria-hidden="true" /> Thêm khoản định kỳ
          </Button>
        </RecurringFormDialog>
      </div>

      {rules.length > 0 ? (
        <dl className="grid grid-cols-2 gap-3 rounded-xl border bg-card p-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Thu cố định mỗi tháng</dt>
            <dd className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatVnd(monthlyIncome)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Chi cố định mỗi tháng</dt>
            <dd className="font-semibold tabular-nums text-rose-700 dark:text-rose-400">
              {formatVnd(monthlyExpense)}
            </dd>
          </div>
        </dl>
      ) : null}

      {rules.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            as="h2"
            title="Chưa có khoản định kỳ nào"
            description="Thêm khoản thu hoặc chi lặp lại mỗi tháng (lương, tiền trọ, internet...) để không phải nhập tay."
          />
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[46rem] text-sm">
            <caption className="sr-only">Danh sách giao dịch định kỳ</caption>
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">Khoản</th>
                <th scope="col" className="px-4 py-3 font-medium">Lịch</th>
                <th scope="col" className="px-4 py-3 font-medium">Lần tới</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Số tiền</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const next = rule.active ? nextOccurrence(rule, today) : null;
                const dto: RecurringDTO = {
                  id: rule.id,
                  type: rule.type,
                  amount: rule.amount,
                  description: rule.description,
                  category: rule.category,
                  dayOfMonth: rule.dayOfMonth,
                  startDateLabel: formatDateVi(rule.startDate),
                };
                return (
                  <tr key={rule.id} className={cn("border-b last:border-b-0", !rule.active && "text-muted-foreground")}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{rule.description}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs">
                        <Badge>{CATEGORY_LABELS[rule.category]}</Badge>
                        {rule.active ? null : <Badge variant="warning">Đang tạm dừng</Badge>}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      Ngày {rule.dayOfMonth} hằng tháng
                      <p className="text-xs text-muted-foreground">từ {formatDateVi(rule.startDate)}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">
                      {next ? (
                        <>
                          {formatDateVi(next)}
                          <p className="text-xs text-muted-foreground">còn {daysBetween(today, next)} ngày</p>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums",
                        rule.active &&
                          (rule.type === "INCOME"
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400"),
                      )}
                    >
                      <span className="sr-only">{rule.type === "INCOME" ? "Thu" : "Chi"} </span>
                      {rule.type === "INCOME" ? "+" : "−"} {formatVnd(rule.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <RecurringToggleButton id={rule.id} active={rule.active} description={rule.description} />
                        <RecurringFormDialog rule={dto}>
                          <Button variant="ghost" size="icon" aria-label={`Sửa khoản định kỳ ${rule.description}`}>
                            <Pencil aria-hidden="true" />
                          </Button>
                        </RecurringFormDialog>
                        <DeleteDialog
                          kind="recurring"
                          id={rule.id}
                          title="Xoá khoản định kỳ này?"
                          description={`“${rule.description}” (${formatVnd(rule.amount)}/tháng) sẽ không tự ghi nữa. Các giao dịch đã ghi trước đó vẫn được giữ lại.`}
                        >
                          <Button variant="ghost" size="icon" aria-label={`Xoá khoản định kỳ ${rule.description}`}>
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

      <p className="text-sm text-muted-foreground">
        App ghi giao dịch khi bạn mở trang, nên nếu lâu không mở thì lần sau các giao dịch còn thiếu sẽ được ghi bù đúng
        ngày. Xoá một giao dịch đã ghi thì lần đó sẽ không bị ghi lại.
      </p>
    </div>
  );
}
