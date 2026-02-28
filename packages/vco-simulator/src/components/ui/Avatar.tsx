// packages/vco-cord/src/components/ui/Avatar.tsx
import { clsx } from "clsx";

interface Props {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" };

export function Avatar({ name, color = "bg-indigo-600", size = "md" }: Props) {
  return (
    <div className={clsx("rounded-full flex items-center justify-center font-bold text-white select-none", color, sizes[size])}>
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
