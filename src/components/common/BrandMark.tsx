import estakasEmblem from "@/assets/estakas-emblem.png";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-white p-1 shadow-soft ring-1 ring-border/70 transition-transform duration-500 group-hover:scale-105",
        className,
      )}
    >
      <img src={estakasEmblem} alt="" aria-hidden="true" className="h-full w-full object-contain" />
    </div>
  );
}
