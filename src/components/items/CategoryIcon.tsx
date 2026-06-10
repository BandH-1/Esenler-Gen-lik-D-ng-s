import type { Category } from "@/lib/mock/types";
import { BookOpen, Shirt, Pencil, Cpu, Dumbbell, Bed } from "lucide-react";

const CATEGORY_ICONS: Record<Category, typeof BookOpen> = {
  kitap: BookOpen,
  kiyafet: Shirt,
  okul: Pencil,
  elektronik: Cpu,
  spor: Dumbbell,
  yurt: Bed,
};

export function CategoryIcon({ category, className }: { category: Category; className?: string }) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={className} />;
}
