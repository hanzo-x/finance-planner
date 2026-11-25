"use client";

import * as React from "react";
import { deleteBudget } from "@/app/actions/budgets";
import { deleteRecurring } from "@/app/actions/recurring";
import { deleteTransaction } from "@/app/actions/transactions";
import { deleteWishlistItem } from "@/app/actions/wishlist";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFormAction } from "@/components/use-form-action";

const ACTIONS = {
  transaction: deleteTransaction,
  wishlist: deleteWishlistItem,
  budget: deleteBudget,
  recurring: deleteRecurring,
} as const;

export function DeleteDialog({
  kind,
  id,
  title,
  description,
  children,
}: {
  kind: keyof typeof ACTIONS;
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <DeleteForm kind={kind} id={id} onDone={() => setOpen(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteForm({
  kind,
  id,
  onDone,
}: {
  kind: keyof typeof ACTIONS;
  id: string;
  onDone: () => void;
}) {
  const [, formAction, pending] = useFormAction(ACTIONS[kind], onDone);
  return (
    <form action={formAction} className="flex justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      <AlertDialogCancel asChild>
        <Button type="button" variant="outline">
          Huỷ
        </Button>
      </AlertDialogCancel>
      <Button type="submit" variant="destructive" disabled={pending}>
        {pending ? "Đang xoá..." : "Xoá"}
      </Button>
    </form>
  );
}
