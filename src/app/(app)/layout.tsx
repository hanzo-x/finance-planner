import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Bỏ qua, tới nội dung chính
      </a>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" aria-label="Finance Planner – Tổng quan">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
              Xin chào, <strong className="font-semibold text-foreground">{user.name}</strong>
            </span>
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-2">
          <NavLinks />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
