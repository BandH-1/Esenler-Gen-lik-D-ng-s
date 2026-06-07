import estakasEmblem from "@/assets/estakas-emblem.png";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#041236] shadow-soft transition-transform duration-500 group-hover:scale-105",
        className,
      )}
    >
      <img src={estakasEmblem} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      <span className="shimmer-sweep absolute inset-0" />
    </div>
  );
}
