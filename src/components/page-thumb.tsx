import Image from "next/image";

export function PageThumb({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={160}
      height={120}
      sizes="80px"
      className="h-[60px] w-20 shrink-0 rounded-xl border object-cover shadow-sm"
    />
  );
}
