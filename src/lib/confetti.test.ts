import { describe, expect, it } from "vitest";
import { createParticles, isAlive, stepParticle } from "./confetti";

function fakeRandom(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("createParticles", () => {
  it("tạo đúng số mảnh, bắn lên trên (vy <= 0) từ khoảng giữa màn hình", () => {
    const particles = createParticles(50, 1000, 800, fakeRandom([0.1, 0.5, 0.9, 0.3]));
    expect(particles).toHaveLength(50);
    for (const p of particles) {
      expect(p.vy).toBeLessThanOrEqual(0);
      expect(p.x).toBeGreaterThanOrEqual(400);
      expect(p.x).toBeLessThanOrEqual(600);
      expect(p.life).toBeGreaterThan(0);
    }
  });
});

describe("stepParticle", () => {
  const base = { x: 100, y: 100, vx: 5, vy: -10, size: 8, rotation: 0, spin: 0.1, color: "#fff", life: 1 };

  it("trọng lực kéo xuống: vy tăng lên sau mỗi khung", () => {
    const next = stepParticle(base);
    expect(next.vy).toBeGreaterThan(base.vy);
  });

  it("di chuyển theo vận tốc và mờ dần", () => {
    const next = stepParticle(base);
    expect(next.x).toBeGreaterThan(base.x);
    expect(next.y).toBeLessThan(base.y);
    expect(next.life).toBeLessThan(base.life);
  });

  it("không sửa mảnh cũ (trả về bản mới)", () => {
    const copy = { ...base };
    stepParticle(base);
    expect(base).toEqual(copy);
  });

  it("tab bị treo lâu (frames rất lớn) vẫn chỉ bay tối đa vài khung", () => {
    const huge = stepParticle(base, 10_000);
    const three = stepParticle(base, 3);
    expect(huge.x).toBeCloseTo(three.x);
    expect(huge.y).toBeCloseTo(three.y);
  });
});

describe("isAlive", () => {
  const p = { x: 0, y: 0, vx: 0, vy: 0, size: 1, rotation: 0, spin: 0, color: "#fff", life: 0.5 };
  it("còn sống khi còn life và còn trong màn hình", () => {
    expect(isAlive(p, 800)).toBe(true);
  });
  it("chết khi hết life hoặc rơi khỏi đáy màn hình", () => {
    expect(isAlive({ ...p, life: 0 }, 800)).toBe(false);
    expect(isAlive({ ...p, y: 900 }, 800)).toBe(false);
  });
});
