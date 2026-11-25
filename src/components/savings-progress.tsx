import { Progress } from "@/components/ui/progress";
import { formatVnd } from "@/lib/money";
import { progressPercent } from "@/lib/milestones";

export function SavingsProgress({
  name,
  cost,
  balance,
  hint,
}: {
  name: string;
  cost: number;
  balance: number;
  hint?: string | null;
}) {
  const percent = progressPercent(balance, cost);
  const missing = Math.max(0, cost - Math.max(balance, 0));
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="truncate font-medium">{name}</span>
        <span className="font-semibold tabular-nums">{percent}%</span>
      </div>
      <Progress value={percent} aria-label={`Tiến độ tiết kiệm cho ${name}`} />
      <p className="text-xs text-muted-foreground">
        {percent >= 100 ? "Đã đủ tiền để mua!" : `Còn thiếu ${formatVnd(missing)}`}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
