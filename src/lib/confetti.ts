export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  life: number;
};

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#ef4444"];
const GRAVITY = 0.28;
const AIR_DRAG = 0.992;
const LIFE_DECAY = 0.007;
const MAX_FRAMES_PER_STEP = 3;

export function createParticles(
  count: number,
  width: number,
  height: number,
  random: () => number = Math.random,
): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = -Math.PI * random();
    const speed = 7 + random() * 9;
    return {
      x: width / 2 + (random() - 0.5) * width * 0.2,
      y: height * 0.4,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 6 + random() * 6,
      rotation: random() * Math.PI * 2,
      spin: (random() - 0.5) * 0.3,
      color: COLORS[Math.floor(random() * COLORS.length)],
      life: 0.7 + random() * 0.3,
    };
  });
}

export function stepParticle(p: Particle, frames = 1): Particle {
  const f = Math.min(Math.max(frames, 0), MAX_FRAMES_PER_STEP);
  const vx = p.vx * AIR_DRAG ** f;
  const vy = p.vy * AIR_DRAG ** f + GRAVITY * f;
  return {
    ...p,
    vx,
    vy,
    x: p.x + vx * f,
    y: p.y + vy * f,
    rotation: p.rotation + p.spin * f,
    life: p.life - LIFE_DECAY * f,
  };
}

export function isAlive(p: Particle, height: number): boolean {
  return p.life > 0 && p.y < height + 20;
}

let running = false;

export function launchConfetti(count = 140): void {
  if (typeof window === "undefined" || running) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(canvas);
  context.scale(ratio, ratio);

  running = true;
  let particles = createParticles(count, width, height);
  let last = performance.now();

  function frame(now: number) {
    const frames = (now - last) / (1000 / 60);
    last = now;
    particles = particles.map((p) => stepParticle(p, frames)).filter((p) => isAlive(p, height));

    context!.clearRect(0, 0, width, height);
    for (const p of particles) {
      context!.save();
      context!.globalAlpha = Math.min(1, p.life * 2);
      context!.translate(p.x, p.y);
      context!.rotate(p.rotation);
      context!.fillStyle = p.color;
      context!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      context!.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
      running = false;
    }
  }
  requestAnimationFrame(frame);
}
