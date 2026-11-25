"use client";

import { saveBudget } from "@/app/actions/budgets";
import { BudgetMeter } from "@/components/budget-meter";
import { DeleteDialog } from "@/components/delete-dialog";
import { FieldError, fieldProps } from "@/components/form-field";
import { useFormAction } from "@/components/use-form-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS, type CategoryKey } from "@/lib/constants";
import { formatVnd } from "@/lib/money";

export function BudgetEditor({
  category,
  budgetId,
  limit,
  spent,
}: {
  category: CategoryKey;
  budgetId: string | null;
  limit: number | null;
  spent: number;
}) {
  const label = CATEGORY_LABELS[category];
  const [state, formAction, pending] = useFormAction(saveBudget);
  const errors = state?.errors?.limit;
  const inputName = `limit-${category}`;

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-2 sm:items-start">
      <div>
        {limit ? (
          <BudgetMeter label={label} spent={spent} limit={limit} />
        ) : (
          <div className="grid gap-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              Đã chi tháng này: {formatVnd(spent)}. Chưa đặt hạn mức.
            </p>
          </div>
        )}
      </div>

      <form action={formAction} className="grid gap-1.5" noValidate>
        <input type="hidden" name="category" value={category} />
        <Label htmlFor={inputName}>Hạn mức tháng cho {label} (VND)</Label>
        <div className="flex gap-2">
          <Input
            {...fieldProps(inputName, errors)}
            name="limit"
            inputMode="numeric"
            autoComplete="off"
            placeholder="VD: 1500000"
            defaultValue={state?.values?.limit ?? (limit ? String(limit) : "")}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "..." : "Lưu"}
          </Button>
          {budgetId ? (
            <DeleteDialog
              kind="budget"
              id={budgetId}
              title={`Xoá ngân sách "${label}"?`}
              description="Bạn sẽ không còn nhận cảnh báo cho danh mục này nữa."
            >
              <Button type="button" variant="outline">
                Xoá
              </Button>
            </DeleteDialog>
          ) : null}
        </div>
        <FieldError name={inputName} errors={errors} />
      </form>
    </div>
  );
}
