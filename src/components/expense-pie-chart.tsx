"use client";

import { Cell, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatVnd } from "@/lib/money";
import type { PieSlice } from "@/lib/summary";

export function ExpensePieChart({ data }: { data: PieSlice[] }) {
  const config: ChartConfig = Object.fromEntries(
    data.map((slice) => [slice.category, { label: slice.label, color: slice.color }]),
  );
  const total = data.reduce((sum, slice) => sum + slice.total, 0);

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,16rem)_1fr]">
      <div aria-hidden="true">
        <ChartContainer config={config} className="mx-auto aspect-square w-full max-w-64">
          {}
          <PieChart accessibilityLayer={false}>
            <ChartTooltip content={<ChartTooltipContent formatValue={formatVnd} />} />
            <Pie
              rootTabIndex={-1}
              data={data}
              dataKey="total"
              nameKey="label"
              innerRadius="58%"
              outerRadius="100%"
              strokeWidth={2}
              stroke="var(--card)"
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.category} fill={`var(--color-${slice.category})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <table className="w-full text-sm">
        <caption className="sr-only">Chi tiêu tháng này theo danh mục</caption>
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th scope="col" className="pb-2 font-medium">Danh mục</th>
            <th scope="col" className="pb-2 text-right font-medium">Số tiền</th>
            <th scope="col" className="pb-2 text-right font-medium">Tỉ lệ</th>
          </tr>
        </thead>
        <tbody>
          {data.map((slice) => (
            <tr key={slice.category} className="border-t">
              <th scope="row" className="py-2 text-left font-normal">
                <span className="flex items-center gap-2">
                  <span
                    className="size-3 shrink-0 rounded-[3px]"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden="true"
                  />
                  {slice.label}
                </span>
              </th>
              <td className="py-2 text-right tabular-nums">{formatVnd(slice.total)}</td>
              <td className="py-2 text-right tabular-nums">{slice.percent.toLocaleString("vi-VN")}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-semibold">
            <th scope="row" className="py-2 text-left">Tổng chi</th>
            <td className="py-2 text-right tabular-nums">{formatVnd(total)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
