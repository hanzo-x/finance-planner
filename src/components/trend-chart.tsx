"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatCompactVnd, formatVnd } from "@/lib/money";
import type { MonthPoint } from "@/lib/trend";

const config: ChartConfig = {
  income: { label: "Thu nhập", color: "#059669" },
  expense: { label: "Chi tiêu", color: "#e11d48" },
};

function shortMonth(label: string) {
  return `${label.slice(0, 3)}${label.slice(5)}`;
}

export function TrendChart({ data }: { data: MonthPoint[] }) {
  return (
    <div>
      <div aria-hidden="true">
        <ChartContainer config={config} className="aspect-[16/8] w-full">
          <BarChart accessibilityLayer={false} data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} tickFormatter={shortMonth} />
            <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={formatCompactVnd} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent showLabel formatValue={formatVnd} />} />
            <Bar dataKey="income" name="Thu nhập" fill="var(--color-income)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="expense" name="Chi tiêu" fill="var(--color-expense)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ChartContainer>
        <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: config.income.color }} /> Thu nhập
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: config.expense.color }} /> Chi tiêu
          </span>
        </div>
      </div>

      <table className="sr-only">
        <caption>Thu nhập và chi tiêu 6 tháng gần nhất</caption>
        <thead>
          <tr>
            <th scope="col">Tháng</th>
            <th scope="col">Thu nhập</th>
            <th scope="col">Chi tiêu</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.key}>
              <th scope="row">{point.label}</th>
              <td>{formatVnd(point.income)}</td>
              <td>{formatVnd(point.expense)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
