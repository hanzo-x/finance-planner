export default function Loading() {
  return (
    <div className="grid animate-pulse gap-4" role="status" aria-label="Đang tải">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 rounded-xl bg-muted md:col-span-2" />
        <div className="h-32 rounded-xl bg-muted" />
      </div>
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  );
}
