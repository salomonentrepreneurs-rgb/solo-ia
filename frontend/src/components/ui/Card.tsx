'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = true, gradient = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5',
        hover && 'hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all duration-300',
        gradient && 'bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/5',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}