"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NativeSelect } from "@/components/ui/native-select";
import { Label } from "@/components/ui/label";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  TRANSACTION_TYPES,
  TYPE_LABELS,
  type CategoryKey,
  type TransactionTypeKey,
} from "@/lib/constants";
import { PERIODS, PERIOD_LABELS, type Period } from "@/lib/dates";
import { cn } from "@/lib/utils";

type Current = { period: Period; category?: CategoryKey; type?: TransactionTypeKey };

function buildHref(current: Current, patch: Partial<Current>): string {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  if (next.period !== "all") params.set("period", next.period);
  if (next.category) params.set("category", next.category);
  if (next.type) params.set("type", next.type);
  const query = params.toString();
  return query ? `/transactions?${query}` : "/transactions";
}

export function TransactionFilters(current: Current) {
  const router = useRouter();
  const hasFilter = current.period !== "all" || current.category || current.type;

  return (
    <div className="grid gap-4 rounded-xl border bg-card p-4 sm:grid-cols-[auto_1fr] sm:items-end">
      <nav aria-label="Lọc theo thời gian">
        <p className="mb-1.5 text-sm font-medium">Thời gian</p>
        <ul className="flex gap-1 rounded-lg bg-muted p-1">
          {PERIODS.map((period) => (
            <li key={period}>
              <Link
                href={buildHref(current, { period })}
                scroll={false}
                aria-current={current.period === period ? "page" : undefined}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current.period === period
                    ? "bg-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {PERIOD_LABELS[period]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="filter-category">Danh mục</Label>
          <NativeSelect
            id="filter-category"
            value={current.category ?? ""}
            onChange={(e) =>
              router.push(buildHref(current, { category: (e.target.value || undefined) as CategoryKey | undefined }), {
                scroll: false,
              })
            }
          >
            <option value="">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="filter-type">Loại</Label>
          <NativeSelect
            id="filter-type"
            value={current.type ?? ""}
            onChange={(e) =>
              router.push(buildHref(current, { type: (e.target.value || undefined) as TransactionTypeKey | undefined }), {
                scroll: false,
              })
            }
          >
            <option value="">Thu và chi</option>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </NativeSelect>
        </div>
        {hasFilter ? (
          <Link
            href="/transactions"
            scroll={false}
            className="inline-flex h-10 items-center px-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Xoá bộ lọc
          </Link>
        ) : null}
      </div>
    </div>
  );
}
