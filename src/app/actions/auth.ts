"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import * as z from "zod";
import type { ActionState } from "@/lib/action-state";
import { auth } from "@/lib/auth";
import { formDataToObject, signInSchema, signUpSchema } from "@/lib/schemas";

function authFailure(error: unknown, values: Record<string, string>): ActionState {
  let message = "Có lỗi xảy ra, vui lòng thử lại.";
  if (error instanceof APIError) {
    const code = String(error.body?.code ?? "");
    if (code.startsWith("USER_ALREADY_EXISTS")) {
      message = "Email này đã được đăng ký. Hãy đăng nhập.";
    } else if (code === "INVALID_EMAIL_OR_PASSWORD") {
      message = "Email hoặc mật khẩu không đúng.";
    } else if (error.statusCode === 429) {
      message = "Bạn thử quá nhiều lần, vui lòng đợi một lúc rồi thử lại.";
    }
  } else {
    console.error("[auth action]", error);
  }
  return { ok: false, message, values };
}

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const values = { name: raw.name ?? "", email: raw.email ?? "" };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại các ô bị lỗi.",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await auth.api.signUpEmail({ body: parsed.data });
  } catch (error) {
    return authFailure(error, values);
  }
  redirect("/dashboard");
}

export async function signInAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const raw = formDataToObject(formData);
  const values = { email: raw.email ?? "" };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại các ô bị lỗi.",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await auth.api.signInEmail({ body: parsed.data });
  } catch (error) {
    return authFailure(error, values);
  }
  redirect("/dashboard");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
