"use server";

import type { ActionState } from "@/lib/action-state";
import { revalidateApp, serverError, validationError } from "@/lib/action-helpers";
import { requireUser } from "@/lib/dal";
import { checkMilestones } from "@/lib/milestone-service";
import { progressPercent, reachedMilestone } from "@/lib/milestones";
import { prisma } from "@/lib/prisma";
import { getBalanceTotals } from "@/lib/queries";
import { formDataToObject, idSchema, wishlistSchema } from "@/lib/schemas";

export async function createWishlistItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const parsed = wishlistSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    await prisma.wishlistItem.create({ data: { ...parsed.data, userId: user.id } });
    revalidateApp();
    const { messages, celebrate } = await checkMilestones(user.id);
    return { ok: true, message: "Đã thêm vào wishlist.", milestones: messages, celebrate };
  } catch (error) {
    return serverError(error);
  }
}

export async function updateWishlistItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const values = formDataToObject(formData);

  const id = idSchema.safeParse(values);
  if (!id.success) return { ok: false, message: "Không tìm thấy món đồ.", values };
  const parsed = wishlistSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error, values);

  try {
    const existing = await prisma.wishlistItem.findFirst({
      where: { id: id.data.id, userId: user.id },
    });
    if (!existing) return { ok: false, message: "Không tìm thấy món đồ.", values };

    const { balance } = await getBalanceTotals(user.id);
    const reached = reachedMilestone(progressPercent(balance, parsed.data.cost));
    const milestone = Math.min(existing.milestone, reached);

    const result = await prisma.wishlistItem.updateMany({
      where: { id: existing.id, userId: user.id },
      data: { ...parsed.data, milestone },
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy món đồ.", values };
    revalidateApp();
    const { messages, celebrate } = await checkMilestones(user.id);
    return { ok: true, message: "Đã cập nhật món đồ.", milestones: messages, celebrate };
  } catch (error) {
    return serverError(error);
  }
}

export async function deleteWishlistItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = idSchema.safeParse(formDataToObject(formData));
  if (!id.success) return { ok: false, message: "Không tìm thấy món đồ." };

  try {
    const result = await prisma.wishlistItem.deleteMany({
      where: { id: id.data.id, userId: user.id },
    });
    if (result.count === 0) return { ok: false, message: "Không tìm thấy món đồ." };
    revalidateApp();
    return { ok: true, message: "Đã xoá món đồ." };
  } catch (error) {
    return serverError(error);
  }
}
