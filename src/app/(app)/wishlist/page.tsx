import type { Metadata } from "next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/delete-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageThumb } from "@/components/page-thumb";
import { SavingsProgress } from "@/components/savings-progress";
import { WishlistFormDialog } from "@/components/wishlist-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRIORITY_LABELS } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { forecastHint } from "@/lib/forecast";
import { formatVnd } from "@/lib/money";
import { getBalanceTotals, getSavingsTrend, getWishlist } from "@/lib/queries";
import { syncRecurring } from "@/lib/recurring-service";

export const metadata: Metadata = { title: "Wishlist" };

const PRIORITY_BADGE = { HIGH: "danger", MEDIUM: "warning", LOW: "default" } as const;

export default async function WishlistPage() {
  const user = await requireUser();
  await syncRecurring(user.id);
  const [items, totals, savings] = await Promise.all([
    getWishlist(user.id),
    getBalanceTotals(user.id),
    getSavingsTrend(user.id),
  ]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PageThumb src="/images/feature-wishlist.png" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>
            <p className="text-sm text-muted-foreground">
              Tiến độ tính theo số dư hiện tại của bạn:{" "}
              <strong className="font-semibold text-foreground tabular-nums">{formatVnd(totals.balance)}</strong>
            </p>
          </div>
        </div>
        <WishlistFormDialog>
          <Button>
            <Plus aria-hidden="true" /> Thêm món đồ
          </Button>
        </WishlistFormDialog>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-card">
          <EmptyState
            image="/images/empty-wishlist.png"
            as="h2"
            title="Chưa có món đồ mong muốn"
            description="Thêm món đồ bạn muốn mua để theo dõi tiến độ tiết kiệm và nhận lời chúc mừng khi đạt mốc."
          />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="h-full">
                <CardHeader className="flex-row items-start justify-between gap-2">
                  <div className="grid gap-1.5">
                    <CardTitle className="leading-snug">{item.name}</CardTitle>
                    <p className="text-lg font-semibold tabular-nums">{formatVnd(item.cost)}</p>
                  </div>
                  <Badge variant={PRIORITY_BADGE[item.priority]}>Ưu tiên {PRIORITY_LABELS[item.priority].toLowerCase()}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <SavingsProgress
                    name={item.name}
                    cost={item.cost}
                    balance={totals.balance}
                    hint={forecastHint({ balance: totals.balance, cost: item.cost, ...savings })}
                  />
                  <div className="flex justify-end gap-1">
                    <WishlistFormDialog
                      item={{ id: item.id, name: item.name, cost: item.cost, priority: item.priority }}
                    >
                      <Button variant="ghost" size="sm" aria-label={`Sửa ${item.name}`}>
                        <Pencil aria-hidden="true" /> Sửa
                      </Button>
                    </WishlistFormDialog>
                    <DeleteDialog
                      kind="wishlist"
                      id={item.id}
                      title="Xoá món đồ này?"
                      description={`“${item.name}” sẽ bị xoá khỏi wishlist và không khôi phục được.`}
                    >
                      <Button variant="ghost" size="sm" aria-label={`Xoá ${item.name}`}>
                        <Trash2 aria-hidden="true" /> Xoá
                      </Button>
                    </DeleteDialog>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
