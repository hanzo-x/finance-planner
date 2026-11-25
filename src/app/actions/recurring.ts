"use server";

import type { ActionState } from "@/lib/action-state";
import { revalidateApp, serverError, validationError } from "@/lib/action-helpers";
import { requireUser } from "@/lib/dal";
import { startOfTodayVn } from "@/lib/dates";
import { checkMilestones } from "@/lib/milestone-service";
import { prisma } from "@/lib/prisma";
import { MAX_RECURRING_PER_USER } from "@/lib/recurring";
import { syncRecurring } from "@/lib/recurring-service";
import {
  formDataToObject,
  idSchema,
  recurringSchema,
  recurringUpdateSchema,
} from "@/lib/schemas";

export async function createRecurring(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const parsed = recurringSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const total = await prisma.recurringTransaction.count({ where: { userId: user.id } });
    if (total >= MAX_RECURRING_PER_USER) {
      return {
        ok: false,
        message: `Mỗi người chỉ được tạo tối đa ${MAX_RECURRING_PER_USER} khoản định kỳ. Hãy xoá bớt khoản không còn dùng.`,
        values,
      };
    }

    await prisma.recurringTransaction.create({ data: { ...parsed.data, userId: user.id } });
    const created = await syncRecurring(user.id);
    revalidateApp();
    const { messages, celebrate } = await checkMilestones(user.id);
    return {
      ok: true,
      message:
        created > 0
          ? `Đã thêm khoản định kỳ và ghi ${created} giao dịch đã đến hạn.`
          : "Đã thêm khoản định kỳ. Giao dịch sẽ tự được ghi khi đến ngày.",
      milestones: messages,
      celebrate,
    };
  } catch (error) {
    return serverError(error);
  }
}

export async function updateRecurring(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const id = idSchema.safeParse(values);
  if (!id.success) return { ok: false, message: "Không tìm thấy khoản định kỳ.", values };
  const parsed = recurringUpdateSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const result = await prisma.recurringTransaction.updateMany({
      where: { id: id.data.id, userId: user.id },
      data: parsed.data,
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy khoản định kỳ.", values };
    revalidateApp();
    return {
      ok: true,
      message: "Đã cập nhật. Thay đổi áp dụng cho các lần ghi sau, giao dịch cũ giữ nguyên.",
    };
  } catch (error) {
    return serverError(error);
  }
}

export async function toggleRecurring(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = idSchema.safeParse(formDataToObject(formData));
  if (!id.success) return { ok: false, message: "Không tìm thấy khoản định kỳ." };

  try {
    const rule = await prisma.recurringTransaction.findFirst({
      where: { id: id.data.id, userId: user.id },
    });
    if (!rule) return { ok: false, message: "Không tìm thấy khoản định kỳ." };

    const turningOn = !rule.active;
    const result = await prisma.recurringTransaction.updateMany({
      where: { id: rule.id, userId: user.id, active: rule.active },
      data: turningOn ? { active: true, generatedThrough: startOfTodayVn() } : { active: false },
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy khoản định kỳ." };
    revalidateApp();
    return {
      ok: true,
      message: turningOn
        ? "Đã bật lại. Từ giờ sẽ ghi tiếp, không ghi bù thời gian đã tạm dừng."
        : "Đã tạm dừng khoản định kỳ.",
    };
  } catch (error) {
    return serverError(error);
  }
}

export async function deleteRecurring(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = idSchema.safeParse(formDataToObject(formData));
  if (!id.success) return { ok: false, message: "Không tìm thấy khoản định kỳ." };

  try {
    const result = await prisma.recurringTransaction.deleteMany({
      where: { id: id.data.id, userId: user.id },
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy khoản định kỳ." };
    revalidateApp();
    return { ok: true, message: "Đã xoá khoản định kỳ. Các giao dịch đã ghi vẫn được giữ lại." };
  } catch (error) {
    return serverError(error);
  }
}
