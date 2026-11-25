import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

const FEATURES = [
  {
    image: "/images/feature-transactions.png",
    title: "Ghi thu chi nhanh gọn",
    text: "Thêm, sửa, xoá giao dịch theo danh mục. Lọc theo tháng, loại và danh mục ngay trên đường dẫn.",
  },
  {
    image: "/images/feature-chart.png",
    title: "Nhìn rõ tiền đi đâu",
    text: "Biểu đồ tròn chi tiêu theo danh mục trong tháng, kèm bảng số liệu dễ đọc.",
  },
  {
    image: "/images/feature-wishlist.png",
    title: "Tiết kiệm cho món đồ mơ ước",
    text: "Đặt wishlist, theo dõi tiến độ và nhận lời chúc mừng khi đạt 50%, 75%, 100%.",
  },
  {
    image: "/images/feature-privacy.png",
    title: "Dữ liệu của riêng bạn",
    text: "Mỗi tài khoản chỉ thấy dữ liệu của chính mình. Đăng nhập bằng email hoặc GitHub.",
  },
];

const STEPS = [
  {
    image: "/images/step-1-register.png",
    title: "Tạo tài khoản",
    text: "Đăng ký bằng email hoặc GitHub, chỉ mất vài giây.",
  },
  {
    image: "/images/step-2-record.png",
    title: "Ghi lại thu chi",
    text: "Nhập khoản thu và chi mỗi ngày, gắn danh mục để dễ thống kê.",
  },
  {
    image: "/images/step-3-goal.png",
    title: "Đạt mục tiêu",
    text: "Theo dõi tiến độ wishlist và nhận lời chúc mừng khi đạt mốc.",
  },
];

export default async function HomePage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Đăng nhập
          </Link>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
          <div className="grid gap-5">
            <h1 className="text-4xl leading-tight font-bold tracking-tight text-balance md:text-5xl">
              Biết tiền đi đâu, <span className="text-primary">tiết kiệm cho điều bạn muốn</span>
            </h1>
            <p className="max-w-prose text-lg text-muted-foreground text-pretty">
              Finance Planner giúp bạn theo dõi thu chi, nhìn bức tranh tài chính qua biểu đồ và được
              động viên mỗi khi tiến gần hơn tới món đồ mơ ước.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
                Bắt đầu miễn phí
              </Link>
              <Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                Tôi đã có tài khoản
              </Link>
            </div>
          </div>
          <Image
            src="/images/hero.png"
            alt="Minh hoạ ví tiền, biểu đồ và heo đất tiết kiệm"
            width={1200}
            height={900}
            priority
            className="w-full rounded-2xl border bg-card object-cover shadow-sm"
          />
        </section>

        <section aria-labelledby="features-title" className="border-t bg-card">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 id="features-title" className="mb-8 text-2xl font-semibold tracking-tight">
              Mọi thứ bạn cần để quản lý chi tiêu
            </h2>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ image, title, text }) => (
                <li key={title} className="grid content-start gap-2">
                  {}
                  <Image
                    src={image}
                    alt=""
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 100vw"
                    className="mb-1 w-full rounded-xl border object-cover"
                  />
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="steps-title" className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 id="steps-title" className="mb-8 text-2xl font-semibold tracking-tight">
              Bắt đầu chỉ với 3 bước
            </h2>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map(({ image, title, text }, index) => (
                <li key={title} className="grid content-start gap-2">
                  <Image
                    src={image}
                    alt=""
                    width={800}
                    height={600}
                    sizes="(min-width: 1152px) 360px, (min-width: 768px) 30vw, 100vw"
                    className="mb-1 w-full rounded-xl border object-cover"
                  />
                  <h3 className="font-semibold">
                    <span className="text-primary">Bước {index + 1}.</span> {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        Đồ án cá nhân môn Phát triển ứng dụng web (PHY10615) · Next.js, Prisma, Better Auth
      </footer>
    </div>
  );
}
