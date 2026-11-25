"use server";

import type { ActionState } from "@/lib/action-state";
import { isUniqueViolation, revalidateApp, serverError, validationError } from "@/lib/action-helpers";
import { budgetWarningsAfterCreate } from "@/lib/budget-service";
import { requireUser } from "@/lib/dal";
import { checkMilestones } from "@/lib/milestone-service";
import { prisma } from "@/lib/prisma";
import { formDataToObject, idSchema, transactionSchema } from "@/lib/schemas";

export async function createTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    await prisma.transaction.create({ data: { ...parsed.data, userId: user.id } });
    revalidateApp();
    const [{ messages, celebrate }, warnings] = await Promise.all([
      checkMilestones(user.id),
      budgetWarningsAfterCreate(user.id, parsed.data),
    ]);
    return { ok: true, message: "Đã thêm giao dịch.", milestones: messages, celebrate, warnings };
  } catch (error) {
    return serverError(error);
  }
}

export async function updateTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const id = idSchema.safeParse(values);
  if (!id.success) return { ok: false, message: "Không tìm thấy giao dịch.", values };
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const result = await prisma.transaction.updateMany({
      where: { id: id.data.id, userId: user.id },
      data: parsed.data,
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy giao dịch.", values };
    revalidateApp();
    const { messages, celebrate } = await checkMilestones(user.id);
    return { ok: true, message: "Đã cập nhật giao dịch.", milestones: messages, celebrate };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, message: "Khoản định kỳ này đã có giao dịch vào ngày đó rồi.", values };
    }
    return serverError(error);
  }
}

export async function deleteTransaction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = idSchema.safeParse(formDataToObject(formData));
  if (!id.success) return { ok: false, message: "Không tìm thấy giao dịch." };

  try {
    const result = await prisma.transaction.deleteMany({
      where: { id: id.data.id, userId: user.id },
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy giao dịch." };
    revalidateApp();
    return { ok: true, message: "Đã xoá giao dịch." };
  } catch (error) {
    return serverError(error);
  }
}
