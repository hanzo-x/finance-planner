import { Lightbulb } from "lucide-react";

export function MonthInsights({ lines }: { lines: string[] }) {
  return (
    <ul className="grid gap-3 text-sm">
      {lines.map((line) => (
        <li key={line} className="flex gap-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
