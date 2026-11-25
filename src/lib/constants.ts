export const TRANSACTION_TYPES = ["INCOME", "EXPENSE"] as const;
export type TransactionTypeKey = (typeof TRANSACTION_TYPES)[number];

export const CATEGORIES = [
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "SHOPPING",
  "BILLS",
  "SALARY",
  "INVESTMENT",
  "OTHER",
] as const;
export type CategoryKey = (typeof CATEGORIES)[number];

export const BUDGET_CATEGORIES = CATEGORIES.filter(
  (c) => c !== "SALARY",
) as Exclude<CategoryKey, "SALARY">[];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type PriorityKey = (typeof PRIORITIES)[number];

export const TYPE_LABELS: Record<TransactionTypeKey, string> = {
  INCOME: "Thu nhập",
  EXPENSE: "Chi tiêu",
};

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  FOOD: "Ăn uống",
  TRANSPORT: "Di chuyển",
  ENTERTAINMENT: "Giải trí",
  SHOPPING: "Mua sắm",
  BILLS: "Hoá đơn",
  SALARY: "Lương",
  INVESTMENT: "Đầu tư",
  OTHER: "Khác",
};

export const PRIORITY_LABELS: Record<PriorityKey, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

export const CATEGORY_COLORS: Record<CategoryKey, string> = {
  FOOD: "#ea580c",
  TRANSPORT: "#0284c7",
  ENTERTAINMENT: "#9333ea",
  SHOPPING: "#db2777",
  BILLS: "#ca8a04",
  SALARY: "#059669",
  INVESTMENT: "#4f46e5",
  OTHER: "#64748b",
};

export const MAX_AMOUNT = 2_000_000_000;

export const MILESTONES = [50, 75, 100] as const;

export const BUDGET_WARNING_PERCENT = 80;
export const BUDGET_OVER_PERCENT = 100;
