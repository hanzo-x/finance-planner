import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "./prisma";

const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? "demo@example.com";

export const getCurrentUser = cache(async () => {
  await connection();
  return prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Chưa có dữ liệu mẫu. Hãy chạy: npx prisma db seed");
  return user;
}
