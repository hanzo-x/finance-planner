const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatVnd(amount: number): string {
  return vndFormatter.format(amount);
}

export function parseVnd(input: string): number | null {
  const text = input.replace(/[\s ]/g, "");
  if (/^\d+$/.test(text)) return Number(text);
  if (/^\d{1,3}([.,]\d{3})+$/.test(text)) return Number(text.replace(/[.,]/g, ""));
  return null;
}

export function formatCompactVnd(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const fmt = (value: number) =>
    value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (abs >= 1_000_000_000) return `${sign}${fmt(abs / 1_000_000_000)} tỷ`;
  if (abs >= 1_000_000) return `${sign}${fmt(abs / 1_000_000)}tr`;
  if (abs >= 1_000) return `${sign}${fmt(abs / 1_000)}k`;
  return `${sign}${abs}`;
}
