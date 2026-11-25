import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { githubEnabled } from "@/lib/auth";
import { getCurrentUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Đăng ký" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <Card>
      <CardHeader>
        <h1 className="text-xl leading-none font-semibold">Tạo tài khoản</h1>
        <CardDescription>Miễn phí. Chỉ mất chưa tới một phút.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm githubEnabled={githubEnabled} />
      </CardContent>
    </Card>
  );
}
