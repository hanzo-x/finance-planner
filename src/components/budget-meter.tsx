import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { budgetLevel, budgetPercent } from "@/lib/budget";
import { formatVnd } from "@/lib/money";

const INDICATOR = {
  ok: "bg-primary",
  warning: "bg-amber-500",
  over: "bg-destructive",
} as const;

export function BudgetMeter({ label, spent, limit }: { label: string; spent: number; limit: number }) {
  const percent = budgetPercent(spent, limit);
  const level = budgetLevel(spent, limit);
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium">
          {label}
          {level === "warning" ? <Badge variant="warning">Sắp hết</Badge> : null}
          {level === "over" ? <Badge variant="danger">Vượt ngân sách</Badge> : null}
        </span>
        <span className="font-semibold tabular-nums">{percent}%</span>
      </div>
      <Progress
        value={Math.min(percent, 100)}
        aria-label={`Đã dùng ${percent}% ngân sách ${label}`}
        indicatorClassName={INDICATOR[level]}
      />
      <p className="text-xs text-muted-foreground tabular-nums">
        {formatVnd(spent)} / {formatVnd(limit)}
      </p>
    </div>
  );
}
