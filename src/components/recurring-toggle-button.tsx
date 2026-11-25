"use client";

import { Pause, Play } from "lucide-react";
import { toggleRecurring } from "@/app/actions/recurring";
import { Button } from "@/components/ui/button";
import { useFormAction } from "@/components/use-form-action";

export function RecurringToggleButton({
  id,
  active,
  description,
}: {
  id: string;
  active: boolean;
  description: string;
}) {
  const [, formAction, pending] = useFormAction(toggleRecurring);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label={`${active ? "Tạm dừng" : "Bật lại"} khoản định kỳ ${description}`}
      >
        {active ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />} {active ? "Tạm dừng" : "Bật lại"}
      </Button>
    </form>
  );
}
