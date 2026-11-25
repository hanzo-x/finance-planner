"use client";

import * as React from "react";
import { Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { launchConfetti } from "@/lib/confetti";

export function CsvTools({ exportQuery }: { exportQuery: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/transactions/import", { method: "POST", body });
      const data = await response.json();

      if (!response.ok) {
        const details = Array.isArray(data.errors)
          ? data.errors.map((e: { line: number; message: string }) => `Dòng ${e.line}: ${e.message}`).join("\n")
          : undefined;
        toast.error(data.error ?? "Nhập CSV thất bại", {
          description: details,
          duration: 12000,
        });
        return;
      }
      toast.success(`Đã nhập ${data.imported} giao dịch.`);
      (data.milestones as string[] | undefined)?.forEach((m) => toast.success(m, { duration: 8000 }));
      if (data.celebrate) launchConfetti();
      router.refresh();
    } catch {
      toast.error("Không kết nối được máy chủ, vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/api/transactions/export${exportQuery}`} download>
          <Download aria-hidden="true" /> Xuất CSV
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload aria-hidden="true" /> {busy ? "Đang nhập..." : "Nhập CSV"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        tabIndex={-1}
        aria-label="Chọn file CSV để nhập"
        onChange={handleFile}
      />
    </div>
  );
}
