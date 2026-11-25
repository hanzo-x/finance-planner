import { describe, expect, it } from "vitest";
import {
  milestoneMessage,
  nextMilestoneToNotify,
  progressPercent,
  reachedMilestone,
} from "./milestones";

describe("progressPercent", () => {
  it("= số dư ÷ giá × 100", () => {
    expect(progressPercent(500_000, 1_000_000)).toBe(50);
    expect(progressPercent(250_000, 1_000_000)).toBe(25);
  });

  it("số dư âm -> 0%", () => {
    expect(progressPercent(-300_000, 1_000_000)).toBe(0);
  });

  it("số dư bằng 0 -> 0%", () => {
    expect(progressPercent(0, 1_000_000)).toBe(0);
  });

  it("số dư lớn hơn giá -> giới hạn ở 100%", () => {
    expect(progressPercent(5_000_000, 1_000_000)).toBe(100);
  });

  it("làm tròn xuống: 99,9% không được hiện thành 100%", () => {
    expect(progressPercent(999, 1000)).toBe(99);
    expect(progressPercent(1, 3)).toBe(33);
  });

  it("giá bằng 0 hoặc âm không làm chương trình lỗi (chia cho 0)", () => {
    expect(progressPercent(1000, 0)).toBe(0);
    expect(progressPercent(1000, -5)).toBe(0);
  });
});

describe("reachedMilestone", () => {
  it("chưa tới 50% -> 0", () => {
    expect(reachedMilestone(0)).toBe(0);
    expect(reachedMilestone(49)).toBe(0);
  });

  it("trả về mốc cao nhất đã chạm", () => {
    expect(reachedMilestone(50)).toBe(50);
    expect(reachedMilestone(74)).toBe(50);
    expect(reachedMilestone(75)).toBe(75);
    expect(reachedMilestone(99)).toBe(75);
    expect(reachedMilestone(100)).toBe(100);
  });
});

describe("nextMilestoneToNotify (không báo lặp lại)", () => {
  const cost = 1_000_000;

  it("chưa tới mốc nào -> không báo", () => {
    expect(nextMilestoneToNotify(400_000, cost, 0)).toBeNull();
  });

  it("vừa chạm 50% lần đầu -> báo 50", () => {
    expect(nextMilestoneToNotify(500_000, cost, 0)).toBe(50);
  });

  it("đã báo 50 rồi mà vẫn ở 50-74% -> KHÔNG báo lại", () => {
    expect(nextMilestoneToNotify(600_000, cost, 50)).toBeNull();
  });

  it("từ 50 lên 75 -> báo 75", () => {
    expect(nextMilestoneToNotify(750_000, cost, 50)).toBe(75);
  });

  it("nhảy vọt từ 0 lên 80% -> chỉ báo mốc cao nhất (75), không báo thêm 50", () => {
    expect(nextMilestoneToNotify(800_000, cost, 0)).toBe(75);
  });

  it("đủ tiền -> báo 100, và không báo lại lần sau", () => {
    expect(nextMilestoneToNotify(1_200_000, cost, 75)).toBe(100);
    expect(nextMilestoneToNotify(1_200_000, cost, 100)).toBeNull();
  });

  it("số dư giảm xuống thì không báo gì", () => {
    expect(nextMilestoneToNotify(100_000, cost, 75)).toBeNull();
  });
});

describe("milestoneMessage", () => {
  it("câu chúc mừng mốc thường", () => {
    expect(milestoneMessage("Laptop mới", 50)).toBe('Bạn đã tiết kiệm được 50% cho "Laptop mới"!');
  });

  it("câu chúc mừng khi đủ tiền", () => {
    expect(milestoneMessage("Laptop mới", 100)).toContain("đủ tiền");
  });
});
