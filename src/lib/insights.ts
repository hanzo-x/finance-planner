import { CATEGORY_LABELS, type CategoryKey } from "./constants";
import { formatVnd } from "./money";

export type InsightInput = {
  expenseByCategory: { category: CategoryKey; total: number }[];
  income: number;
  expense: number;
  previousExpenseSamePeriod: number;
};

const SIMILAR_PERCENT = 3;

export function monthInsights(input: InsightInput): string[] {
  const { expenseByCategory, income, expense, previousExpenseSamePeriod } = input;

  if (income === 0 && expense === 0) {
    return ["Tháng này chưa có giao dịch nào. Hãy thêm vài khoản thu chi để xem nhận xét."];
  }

  const insights: string[] = [];

  if (expense > 0) {
    const top = expenseByCategory
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)[0];
    if (top) {
      const percent = Math.round((top.total / expense) * 100);
      insights.push(`Bạn chi nhiều nhất cho ${CATEGORY_LABELS[top.category]} (${percent}% tổng chi).`);
    }
  }

  if (previousExpenseSamePeriod > 0 && expense > 0) {
    const change = ((expense - previousExpenseSamePeriod) / previousExpenseSamePeriod) * 100;
    const rounded = Math.round(Math.abs(change));
    if (Math.abs(change) < SIMILAR_PERCENT) {
      insights.push("Chi tiêu gần bằng cùng kỳ tháng trước.");
    } else if (change > 0) {
      insights.push(`Chi tiêu tăng ${rounded}% so với cùng kỳ tháng trước.`);
    } else {
      insights.push(`Chi tiêu giảm ${rounded}% so với cùng kỳ tháng trước. Làm tốt lắm!`);
    }
  }

  if (income > 0) {
    const net = income - expense;
    if (net >= 0) {
      insights.push(`Bạn giữ lại được ${Math.floor((net / income) * 100)}% thu nhập tháng này.`);
    } else {
      insights.push(`Tháng này bạn chi vượt thu ${formatVnd(-net)}.`);
    }
  } else if (expense > 0) {
    insights.push("Tháng này chưa có khoản thu nào được ghi lại.");
  }

  return insights;
}
