"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Có lỗi xảy ra</h1>
      <p className="text-muted-foreground">
        Rất tiếc, trang không tải được. Bạn thử lại sau ít giây nhé.
      </p>
      <Button onClick={reset}>Thử lại</Button>
    </main>
  );
}
