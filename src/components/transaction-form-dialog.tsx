"use client";

import * as React from "react";
import { createTransaction, updateTransaction } from "@/app/actions/transactions";
import { Field, fieldProps } from "@/components/form-field";
import { useFormAction } from "@/components/use-form-action";
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

export type TransactionDTO = {
  id: string;
  type: TransactionTypeKey;
  amount: number;
  description: string;
  category: CategoryKey;
  date: string;
};

export function TransactionFormDialog({
  transaction,
  children,
}: {
  transaction?: TransactionDTO;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Sửa giao dịch" : "Thêm giao dịch"}</DialogTitle>
          <DialogDescription>Các ô có dấu * là bắt buộc.</DialogDescription>
        </DialogHeader>
        {}
        <TransactionForm transaction={transaction} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function TransactionForm({
  transaction,
  onDone,
}: {
  transaction?: TransactionDTO;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useFormAction(
    transaction ? updateTransaction : createTransaction,
    onDone,
  );
  const errors = state?.errors;
  const values = state?.values;

  const type = values?.type ?? transaction?.type ?? "EXPENSE";
  const amount = values?.amount ?? (transaction ? String(transaction.amount) : "");
  const description = values?.description ?? transaction?.description ?? "";
  const category = values?.category ?? transaction?.category ?? "FOOD";
  const date = values?.date ?? transaction?.date ?? todayInputValue();

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {transaction ? <input type="hidden" name="id" value={transaction.id} /> : null}

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">Loại giao dịch *</legend>
        <div className="grid grid-cols-2 gap-2">
          {TRANSACTION_TYPES.map((t) => (
            <label key={t} className="relative cursor-pointer">
              <input
                type="radio"
                name="type"
                value={t}
                defaultChecked={type === t}
                className="peer sr-only"
              />
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

      <Field name="amount" label="Số tiền (VND) *" errors={errors?.amount} hint="Chỉ gồm chữ số, ví dụ 50000 hoặc 50.000">
        <Input
          {...fieldProps("amount", errors?.amount)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="VD: 50000"
          defaultValue={amount}
        />
      </Field>

      <Field name="description" label="Mô tả *" errors={errors?.description} hint="Từ 1 đến 120 ký tự">
        <Input
          {...fieldProps("description", errors?.description)}
          maxLength={200}
          autoComplete="off"
          placeholder="VD: Ăn trưa với bạn"
          defaultValue={description}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="category" label="Danh mục *" errors={errors?.category}>
          <NativeSelect {...fieldProps("category", errors?.category)} defaultValue={category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field name="date" label="Ngày *" errors={errors?.date}>
          <Input {...fieldProps("date", errors?.date)} type="date" defaultValue={date} />
        </Field>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : transaction ? "Lưu thay đổi" : "Thêm giao dịch"}
      </Button>
    </form>
  );
}
