"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = Record<string, { label?: string; color?: string }>;

type ChartContainerProps = Omit<React.ComponentProps<"div">, "children"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
};

function ChartContainer({ config, className, children, style, ...props }: ChartContainerProps) {
  const colorVars = Object.fromEntries(
    Object.entries(config)
      .filter(([, value]) => value.color)
      .map(([key, value]) => [`--color-${key}`, value.color]),
  );

  return (
    <div
      data-slot="chart"
      className={cn("flex aspect-video justify-center text-xs [&_.recharts-surface]:outline-hidden", className)}
      style={{ ...colorVars, ...style } as React.CSSProperties}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
    </div>
  );
}

type TooltipItem = {
  name?: string | number;
  value?: number | string | readonly (number | string)[];
  color?: string;
  payload?: { fill?: string; color?: string };
};

function ChartTooltipContent({
  active,
  payload,
  label,
  showLabel = false,
  formatValue,
}: {
  active?: boolean;
  payload?: readonly TooltipItem[];
  label?: string | number;
  showLabel?: boolean;
  formatValue?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="grid min-w-32 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {showLabel && label !== undefined ? <div className="font-medium">{label}</div> : null}
      {payload.map((item, index) => {
        const color = item.payload?.fill ?? item.payload?.color ?? item.color;
        const value = typeof item.value === "number" ? item.value : Number(item.value);
        return (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              {item.name}
            </span>
            <span className="font-mono font-medium tabular-nums">
              {formatValue ? formatValue(value) : value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

export { ChartContainer, ChartTooltip, ChartTooltipContent };
