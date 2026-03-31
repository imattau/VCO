import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'nested' | 'glass';
}

export function Card({ 
  className, 
  variant = 'default', 
  ...props 
}: CardProps) {
  return (
    <div 
      className={cn(
        "rounded-3xl border transition-all",
        variant === 'default' && "bg-zinc-900 border-zinc-800 shadow-xl shadow-black/20",
        variant === 'nested' && "bg-zinc-950 border-zinc-800 shadow-inner",
        variant === 'glass' && "bg-zinc-900/50 backdrop-blur-xl border-zinc-800 shadow-2xl",
        className
      )}
      {...props}
    />
  );
}
