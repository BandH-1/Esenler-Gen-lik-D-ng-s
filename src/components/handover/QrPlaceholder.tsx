import { cn } from "@/lib/utils";

export function QrPlaceholder({
  code,
  size = 160,
  className,
}: {
  code: string;
  size?: number;
  className?: string;
}) {
  // deterministic pseudo-QR from code
  const cells = 17;
  const rng = (i: number) => {
    let h = 0;
    const s = `${code}-${i}`;
    for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) | 0;
    return (h & 0xffff) / 0xffff;
  };
  return (
    <div
      className={cn("rounded-2xl bg-white p-3 ring-1 ring-border", className)}
      style={{ width: size + 24 }}
    >
      <svg viewBox={`0 0 ${cells} ${cells}`} width={size} height={size}>
        {Array.from({ length: cells * cells }).map((_, i) => {
          const x = i % cells;
          const y = Math.floor(i / cells);
          const corner = (x < 3 && y < 3) || (x > cells - 4 && y < 3) || (x < 3 && y > cells - 4);
          const on = corner ? true : rng(i) > 0.55;
          return on ? <rect key={i} x={x} y={y} width={1} height={1} fill="#0f172a" /> : null;
        })}
      </svg>
      <div className="mt-2 text-center font-mono text-xs tracking-wider text-muted-foreground">
        {code}
      </div>
    </div>
  );
}
