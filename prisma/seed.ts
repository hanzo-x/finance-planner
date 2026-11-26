import "dotenv/config";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? "demo@example.com";
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

function buildTransactions(userId: string) {
  const today = todayVn();
  const rows = [];
  for (const { offset, factor } of MONTH_PLAN) {
    for (const t of MONTHLY) {
      if (offset === 0 && t.day > today.day && t.fixed) continue;
      const day = offset === 0 ? Math.min(t.day, today.day) : t.day;
      const amount = t.fixed ? t.amount : Math.max(5000, roundTo5000(t.amount * factor));
      rows.push({
        userId,
        type: t.type,
        category: t.category,
        amount,
        description: t.description,
        date: new Date(Date.UTC(today.year, today.month + offset, day)),
      });
    }
  }
  return rows;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Thiếu DATABASE_URL (xem .env.example)");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: { id: randomUUID(), name: DEMO_NAME, email: DEMO_EMAIL },
  });

  const transactions = buildTransactions(user.id);
  await prisma.transaction.createMany({ data: transactions });

  const balance = transactions.reduce(
    (sum, t) => sum + (t.type === "INCOME" ? t.amount : -t.amount),
    0,
  );

  console.log(`✅ Đã tạo tài khoản demo: ${DEMO_EMAIL}`);
  console.log(`   ${transactions.length} giao dịch mẫu`);
  console.log(`   Số dư demo: ${balance.toLocaleString("vi-VN")} ₫`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
