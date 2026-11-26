import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" aria-label="Về trang chủ Finance Planner">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pb-16 lg:grid-cols-2">
        {}
        <Image
          src="/images/auth-side.png"
          alt=""
          width={900}
          height={1200}
          sizes="(min-width: 1024px) 480px, 0px"
          className="hidden max-h-[34rem] w-full rounded-2xl border object-cover object-bottom lg:block"
        />
        <main id="main" className="mx-auto flex w-full max-w-md flex-col justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}
