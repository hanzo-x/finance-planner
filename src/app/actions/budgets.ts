"use server";

import type { ActionState } from "@/lib/action-state";
import { revalidateApp, serverError, validationError } from "@/lib/action-helpers";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { budgetSchema, formDataToObject, idSchema } from "@/lib/schemas";

export async function saveBudget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const parsed = budgetSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    await prisma.budget.upsert({
      where: { userId_category: { userId: user.id, category: parsed.data.category } },
      update: { limit: parsed.data.limit },
      create: { userId: user.id, category: parsed.data.category, limit: parsed.data.limit },
    });
    revalidateApp();
    return { ok: true, message: "Đã lưu ngân sách." };
  } catch (error) {
    return serverError(error);
  }
}

export async function deleteBudget(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const id = idSchema.safeParse(formDataToObject(formData));
  if (!id.success) return { ok: false, message: "Không tìm thấy ngân sách." };

  try {
    const result = await prisma.budget.deleteMany({ where: { id: id.data.id, userId: user.id } });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy ngân sách." };
    revalidateApp();
    return { ok: true, message: "Đã xoá ngân sách." };
  } catch (error) {
    return serverError(error);
  }
}
