import "server-only";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import type { ActionState } from "./action-state";

export function validationError(error: z.ZodError, values: Record<string, string>): ActionState {
  return {
    ok: false,
    message: "Vui lòng kiểm tra lại các ô bị lỗi.",
    errors: z.flattenError(error).fieldErrors,
    values,
  };
}

export function serverError(error: unknown): ActionState {
  console.error("[server action]", error);
  return { ok: false, message: "Có lỗi xảy ra phía máy chủ, vui lòng thử lại." };
}

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export function revalidateApp() {
  revalidatePath("/", "layout");
}
