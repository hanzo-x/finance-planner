import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../src/generated/prisma/client";
import { progressPercent, reachedMilestone } from "../src/lib/milestones";

const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? "demo@example.com";
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "Demo@2026Planner";
const DEMO_NAME = "Người dùng demo";

type Template = {
  day: number;
  type: "INCOME" | "EXPENSE";
  category:
    | "FOOD"
    | "TRANSPORT"
    | "ENTERTAINMENT"
    | "SHOPPING"
    | "BILLS"
    | "SALARY"
    | "INVESTMENT"
    | "OTHER";
  amount: number;
  description: string;
  fixed?: boolean;
};

const MONTHLY: Template[] = [
  { day: 1, type: "INCOME", category: "SALARY", amount: 12_000_000, description: "Lương tháng", fixed: true },
  { day: 2, type: "EXPENSE", category: "BILLS", amount: 2_500_000, description: "Tiền trọ", fixed: true },
  { day: 3, type: "EXPENSE", category: "FOOD", amount: 45_000, description: "Bún bò buổi sáng" },
  { day: 5, type: "EXPENSE", category: "FOOD", amount: 350_000, description: "Đi chợ cuối tuần" },
  { day: 7, type: "EXPENSE", category: "TRANSPORT", amount: 150_000, description: "Đổ xăng xe máy" },
  { day: 9, type: "EXPENSE", category: "BILLS", amount: 420_000, description: "Tiền điện nước" },
  { day: 11, type: "EXPENSE", category: "ENTERTAINMENT", amount: 220_000, description: "Xem phim cùng bạn" },
  { day: 13, type: "EXPENSE", category: "FOOD", amount: 280_000, description: "Ăn tối cùng nhóm bạn" },
  { day: 15, type: "INCOME", category: "INVESTMENT", amount: 600_000, description: "Lãi tiết kiệm" },
  { day: 17, type: "EXPENSE", category: "SHOPPING", amount: 750_000, description: "Mua quần áo" },
  { day: 19, type: "EXPENSE", category: "TRANSPORT", amount: 90_000, description: "Đi xe buýt, gửi xe" },
  { day: 21, type: "EXPENSE", category: "BILLS", amount: 200_000, description: "Internet + điện thoại", fixed: true },
  { day: 23, type: "EXPENSE", category: "ENTERTAINMENT", amount: 180_000, description: "Cà phê và trò chơi" },
  { day: 26, type: "INCOME", category: "OTHER", amount: 1_500_000, description: "Dạy kèm môn Vật lý" },
  { day: 28, type: "EXPENSE", category: "FOOD", amount: 210_000, description: "Đồ ăn vặt và nước uống" },
];

const MONTH_PLAN = [
  { offset: -2, factor: 1.0 },
  { offset: -1, factor: 1.1 },
  { offset: 0, factor: 0.95 },
];

function roundTo5000(value: number) {
  return Math.round(value / 5000) * 5000;
}

function todayVn() {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return { year: vn.getUTCFullYear(), month: vn.getUTCMonth(), day: vn.getUTCDate() };
}

const RECURRING_TEMPLATES = MONTHLY.filter((t) => t.fixed);

function buildTransactions(userId: string, ruleIds: Map<Template, string>) {
  const today = todayVn();
  const rows = [];
  for (const { offset, factor } of MONTH_PLAN) {
    for (const t of MONTHLY) {
      const recurringId = ruleIds.get(t);
      if (offset === 0 && t.day > today.day && recurringId) continue;
      const day = offset === 0 ? Math.min(t.day, today.day) : t.day;
      const amount = t.fixed ? t.amount : Math.max(5000, roundTo5000(t.amount * factor));
      rows.push({
        userId,
        type: t.type,
        category: t.category,
        amount,
        description: t.description,
        date: new Date(Date.UTC(today.year, today.month + offset, day)),
        recurringId: recurringId ?? null,
      });
    }
  }
  return rows;
}

const WISHLIST = [
  { name: "Laptop mới", cost: 40_000_000, priority: "HIGH" as const },
  { name: "Điện thoại mới", cost: 30_000_000, priority: "MEDIUM" as const },
  { name: "Chuyến đi Đà Lạt", cost: 6_000_000, priority: "LOW" as const },
  { name: "Bàn phím cơ", cost: 2_500_000, priority: "LOW" as const },
];

const BUDGETS = [
  { category: "FOOD" as const, limit: 1_200_000 },
  { category: "TRANSPORT" as const, limit: 400_000 },
  { category: "ENTERTAINMENT" as const, limit: 500_000 },
  { category: "SHOPPING" as const, limit: 1_000_000 },
  { category: "BILLS" as const, limit: 3_500_000 },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Thiếu DATABASE_URL (xem .env.example)");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const seedAuth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: { enabled: true },
    secret: process.env.BETTER_AUTH_SECRET ?? "seed-only-secret-seed-only-secret-0123456789",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  });

  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const { user } = await seedAuth.api.signUpEmail({
    body: { name: DEMO_NAME, email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });

  const today = todayVn();
  const ruleIds = new Map<Template, string>();
  for (const t of RECURRING_TEMPLATES) {
    const rule = await prisma.recurringTransaction.create({
      data: {
        userId: user.id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        dayOfMonth: t.day,
        startDate: new Date(Date.UTC(today.year, today.month - 2, t.day)),
      },
    });
    ruleIds.set(t, rule.id);
  }

  const transactions = buildTransactions(user.id, ruleIds);
  await prisma.transaction.createMany({ data: transactions });

  for (const t of RECURRING_TEMPLATES) {
    const id = ruleIds.get(t)!;
    const dates = transactions.filter((row) => row.recurringId === id).map((row) => row.date.getTime());
    await prisma.recurringTransaction.update({
      where: { id },
      data: { generatedThrough: new Date(Math.max(...dates)) },
    });
  }

  const balance = transactions.reduce(
    (sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount),
    0,
  );
  await prisma.wishlistItem.createMany({
    data: WISHLIST.map((item) => ({
      ...item,
      userId: user.id,
      milestone: reachedMilestone(progressPercent(balance, item.cost)),
    })),
  });
  await prisma.budget.createMany({ data: BUDGETS.map((b) => ({ ...b, userId: user.id })) });

  console.log(`✅ Đã tạo tài khoản demo: ${DEMO_EMAIL}`);
  console.log(
    `   ${transactions.length} giao dịch, ${RECURRING_TEMPLATES.length} khoản định kỳ, ${WISHLIST.length} món wishlist, ${BUDGETS.length} ngân sách`,
  );
  console.log(`   Số dư demo: ${balance.toLocaleString("vi-VN")} ₫`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
