"use client";

import { useActionState } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/action-state";
import { launchConfetti } from "@/lib/confetti";

type ServerAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function showResultToasts(result: ActionState) {
  if (!result) return;
  if (result.ok) {
    if (result.message) toast.success(result.message);
    result.milestones?.forEach((m) => toast.success(m, { duration: 8000 }));
    if (result.celebrate) launchConfetti();
    result.warnings?.forEach((w) => toast.warning(w, { duration: 8000 }));
  } else if (result.message && !result.errors) {
    toast.error(result.message);
  }
}

export function useFormAction(action: ServerAction, onSuccess?: () => void) {
  return useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await action(prev, formData);
    showResultToasts(result);
    if (result?.ok) onSuccess?.();
    return result;
  }, null);
}
