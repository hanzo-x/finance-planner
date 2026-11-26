import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <Image
        src="/images/not-found.png"
        alt=""
        width={800}
        height={600}
        sizes="320px"
        className="w-full max-w-xs rounded-2xl border object-cover"
      />
      <p className="text-5xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Không tìm thấy trang</h1>
      <p className="text-muted-foreground">Đường dẫn này không tồn tại hoặc đã bị chuyển đi.</p>
      <Link href="/" className={buttonVariants()}>
        Về trang chủ
      </Link>
    </main>
  );
}
