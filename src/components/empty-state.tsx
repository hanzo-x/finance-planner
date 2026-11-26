import * as React from "react";
import Image from "next/image";

export function EmptyState({
  title,
  description,
  image,
  as: Heading = "h3",
  children,
}: {
  title: string;
  description: string;
  image?: string;
  as?: "h2" | "h3";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      {image ? (
        <Image src={image} alt="" width={800} height={600} sizes="192px" className="w-48 rounded-xl border object-cover" />
      ) : (
        <svg viewBox="0 0 120 90" className="w-28 text-primary" fill="none" aria-hidden="true" focusable="false">
          <ellipse cx="60" cy="80" rx="42" ry="6" className="fill-muted" />
          <rect x="26" y="26" width="68" height="46" rx="8" className="fill-secondary stroke-primary" strokeWidth="2.5" />
          <path d="M26 40h68" className="stroke-primary" strokeWidth="2.5" />
          <circle cx="80" cy="56" r="5" className="fill-primary" />
          <circle cx="86" cy="22" r="9" className="fill-background stroke-primary" strokeWidth="2.5" />
          <path d="M86 18v8M83 22h6" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <Heading className="text-base font-semibold">{title}</Heading>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
