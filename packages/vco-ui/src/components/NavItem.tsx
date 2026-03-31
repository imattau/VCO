import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
  className?: string;
  iconClassName?: string;
}

export function NavItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  badge, 
  className,
  iconClassName 
}: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-bold transition-all group relative",
        active ? "bg-zinc-800 text-white shadow-lg shadow-zinc-800/20" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100",
        className
      )}
    >
      <div className={cn(
        active ? "text-blue-500" : "text-zinc-500 group-hover:text-zinc-300",
        iconClassName
      )}>
        {icon}
      </div>
      <span className="hidden md:block flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className={cn(
          "absolute top-2 left-6 md:static bg-blue-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-black",
          active && "animate-pulse"
        )}>
          {badge}
        </span>
      )}
      {active && <div className="absolute left-0 w-1 h-6 bg-blue-500 rounded-full hidden md:block" />}
    </button>
  );
}
