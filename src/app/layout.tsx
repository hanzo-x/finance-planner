import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "Finance Planner – Quản lý chi tiêu cá nhân",
    template: "%s · Finance Planner",
  },
  description:
    "Theo dõi thu chi, xem bức tranh tài chính qua biểu đồ và tiết kiệm cho những món đồ mơ ước.",
  openGraph: {
    title: "Finance Planner",
    description: "Quản lý chi tiêu cá nhân và tiết kiệm cho món đồ mơ ước.",
    images: ["/og.png"],
    locale: "vi_VN",
    type: "website",
  },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1512" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-dvh">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
