"use client";

import * as React from "react";
import { createRecurring, updateRecurring } from "@/app/actions/recurring";
import { Field, fieldProps } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useFormAction } from "@/components/use-form-action";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  TRANSACTION_TYPES,
  TYPE_LABELS,
  type CategoryKey,
  type TransactionTypeKey,
} from "@/lib/constants";
import { todayInputValue } from "@/lib/dates";
import { cn } from "@/lib/utils";

export type RecurringDTO = {
  id: string;
  type: TransactionTypeKey;
  amount: number;
  description: string;
  category: CategoryKey;
  dayOfMonth: number;
  startDateLabel: string;
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export function RecurringFormDialog({
  rule,
  children,
}: {
  rule?: RecurringDTO;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rule ? "Sửa khoản định kỳ" : "Thêm khoản định kỳ"}</DialogTitle>
          <DialogDescription>
            Khoản này tự được ghi thành giao dịch vào một ngày cố định mỗi tháng. Các ô có dấu * là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <RecurringForm rule={rule} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function RecurringForm({ rule, onDone }: { rule?: RecurringDTO; onDone: () => void }) {
  const [state, formAction, pending] = useFormAction(rule ? updateRecurring : createRecurring, onDone);
  const errors = state?.errors;
  const values = state?.values;

  const type = values?.type ?? rule?.type ?? "EXPENSE";
  const amount = values?.amount ?? (rule ? String(rule.amount) : "");
  const description = values?.description ?? rule?.description ?? "";
  const category = values?.category ?? rule?.category ?? "BILLS";
  const dayOfMonth = values?.dayOfMonth ?? (rule ? String(rule.dayOfMonth) : "1");
  const startDate = values?.startDate ?? todayInputValue();

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {rule ? <input type="hidden" name="id" value={rule.id} /> : null}

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Loại giao dịch *</legend>
        <div className="grid grid-cols-2 gap-2">
          {TRANSACTION_TYPES.map((t) => (
            <label key={t} className="relative cursor-pointer">
              <input type="radio" name="type" value={t} defaultChecked={type === t} className="peer sr-only" />
              <span
                className={cn(
                  "flex h-10 items-center justify-center rounded-lg border border-input text-sm font-medium transition-colors",
                  "peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                )}
              >
                {TYPE_LABELS[t]}
              </span>
            </label>
          ))}
        </div>
        {errors?.type ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.type[0]}
          </p>
        ) : null}
      </fieldset>

      <Field name="amount" label="Số tiền mỗi tháng (VND) *" errors={errors?.amount} hint="Chỉ gồm chữ số, ví dụ 2500000 hoặc 2.500.000">
        <Input
          {...fieldProps("amount", errors?.amount)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="VD: 2500000"
          defaultValue={amount}
        />
      </Field>

      <Field name="description" label="Mô tả *" errors={errors?.description} hint="Từ 1 đến 120 ký tự">
        <Input
          {...fieldProps("description", errors?.description)}
          maxLength={200}
          autoComplete="off"
          placeholder="VD: Tiền trọ"
          defaultValue={description}
        />
      </Field>

      <Field name="category" label="Danh mục *" errors={errors?.category}>
        <NativeSelect {...fieldProps("category", errors?.category)} defaultValue={category}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </NativeSelect>
      </Field>

      {rule ? (
        <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          Ghi vào <strong className="text-foreground">ngày {rule.dayOfMonth}</strong> hằng tháng, bắt đầu từ{" "}
          <strong className="text-foreground">{rule.startDateLabel}</strong>. Hai thông tin này không sửa được; muốn đổi
          hãy tạm dừng khoản này rồi tạo khoản mới. Chỉnh sửa chỉ áp dụng cho các lần ghi sau.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="dayOfMonth" label="Ghi vào ngày *" errors={errors?.dayOfMonth} hint="Tháng ngắn hơn thì lấy ngày cuối tháng">
            <NativeSelect {...fieldProps("dayOfMonth", errors?.dayOfMonth)} defaultValue={dayOfMonth}>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  Ngày {d}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field name="startDate" label="Bắt đầu từ *" errors={errors?.startDate} hint="Ngày đã qua sẽ được ghi bù">
            <Input {...fieldProps("startDate", errors?.startDate)} type="date" defaultValue={startDate} />
          </Field>
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : rule ? "Lưu thay đổi" : "Thêm khoản định kỳ"}
      </Button>
    </form>
  );
}
