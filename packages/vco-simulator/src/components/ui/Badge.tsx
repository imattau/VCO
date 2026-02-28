// packages/vco-cord/src/components/ui/Badge.tsx
import React from "react";
import { clsx } from "clsx";

interface Props {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning";
}

const variants = {
  default: "bg-zinc-700 text-zinc-300",
  success: "bg-emerald-800 text-emerald-300",
  danger: "bg-red-800 text-red-300",
  warning: "bg-yellow-800 text-yellow-300",
};

export function Badge({ children, variant = "default" }: Props) {
  return (
    <span className={clsx("px-1.5 py-0.5 rounded text-xs font-mono", variants[variant])}>
      {children}
    </span>
  );
}
