"use client";

import * as React from "react";
import { createWishlistItem, updateWishlistItem } from "@/app/actions/wishlist";
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
import { PRIORITIES, PRIORITY_LABELS, type PriorityKey } from "@/lib/constants";

export type WishlistDTO = {
  id: string;
  name: string;
  cost: number;
  priority: PriorityKey;
};

export function WishlistFormDialog({
  item,
  children,
}: {
  item?: WishlistDTO;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa món đồ" : "Thêm món đồ mong muốn"}</DialogTitle>
          <DialogDescription>Nhập tên món đồ, giá và mức ưu tiên.</DialogDescription>
        </DialogHeader>
        <WishlistForm item={item} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function WishlistForm({ item, onDone }: { item?: WishlistDTO; onDone: () => void }) {
  const [state, formAction, pending] = useFormAction(
    item ? updateWishlistItem : createWishlistItem,
    onDone,
  );
  const errors = state?.errors;
  const values = state?.values;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <Field name="name" label="Tên món đồ *" errors={errors?.name}>
        <Input
          {...fieldProps("name", errors?.name)}
          maxLength={120}
          autoComplete="off"
          placeholder="VD: Laptop mới"
          defaultValue={values?.name ?? item?.name ?? ""}
        />
      </Field>

      <Field name="cost" label="Giá (VND) *" errors={errors?.cost} hint="Chỉ gồm chữ số, ví dụ 25000000 hoặc 25.000.000">
        <Input
          {...fieldProps("cost", errors?.cost)}
          inputMode="numeric"
          autoComplete="off"
          placeholder="VD: 25000000"
          defaultValue={values?.cost ?? (item ? String(item.cost) : "")}
        />
      </Field>

      <Field name="priority" label="Mức ưu tiên *" errors={errors?.priority}>
        <NativeSelect
          {...fieldProps("priority", errors?.priority)}
          defaultValue={values?.priority ?? item?.priority ?? "MEDIUM"}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm món đồ"}
      </Button>
    </form>
  );
}
