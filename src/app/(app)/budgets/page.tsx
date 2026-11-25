import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { BudgetEditor } from "@/components/budget-editor";
import { CATEGORY_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { getBudgetRows } from "@/lib/queries";
import { syncRecurring } from "@/lib/recurring-service";

export const metadata: Metadata = { title: "Ngân sách" };

export default async function BudgetsPage() {
  const user = await requireUser();
  await syncRecurring(user.id);
  const rows = await getBudgetRows(user.id);
  const alerts = rows.filter((row) => row.level !== "ok");

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ngân sách theo danh mục</h1>
        <p className="text-sm text-muted-foreground">
          Đặt hạn mức chi mỗi tháng cho từng danh mục. Bạn sẽ được cảnh báo khi dùng hơn 80% và khi vượt 100%.
        </p>
      </div>

      {alerts.length > 0 ? (
        <div
          role="status"
          className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <ul className="grid gap-1">
            {alerts.map((row) => (
              <li key={row.category}>
                {row.level === "over"
                  ? `Đã vượt ngân sách “${CATEGORY_LABELS[row.category]}” tháng này.`
                  : `“${CATEGORY_LABELS[row.category]}” đã dùng ${row.percent}% ngân sách tháng này.`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3">
        {rows.map((row) => (
          <BudgetEditor
            key={row.category}
            category={row.category}
            budgetId={row.budgetId}
            limit={row.limit}
            spent={row.spent}
          />
        ))}
      </div>
    </div>
  );
}
