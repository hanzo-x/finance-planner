import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M8 12.5A2.5 2.5 0 0 1 10.5 10H22a2 2 0 0 1 2 2v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 8 21V12.5Z"
        className="fill-primary-foreground"
      />
      <path d="M8 13h14" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20.5" cy="17.5" r="1.6" className="fill-primary" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>Finance Planner</span>
    </span>
  );
}
