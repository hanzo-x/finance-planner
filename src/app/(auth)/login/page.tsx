import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { githubEnabled } from "@/lib/auth";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Đăng nhập" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <Card>
      <CardHeader>
        <h1 className="text-xl leading-none font-semibold">Đăng nhập</h1>
        <CardDescription>Chào mừng trở lại! Nhập email và mật khẩu của bạn.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm githubEnabled={githubEnabled} />
      </CardContent>
    </Card>
  );
}
