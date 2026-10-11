import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'rose' | 'neutral' | 'blue'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  const variantClasses = {
    emerald: 'bg-emerald-950/70 border-emerald-800/80 text-emerald-300',
    amber: 'bg-amber-950/70 border-amber-800/80 text-amber-300',
    rose: 'bg-rose-950/70 border-rose-800/80 text-rose-300',
    neutral: 'bg-[#1a1e28] border-[#2d3647] text-slate-300',
    blue: 'bg-blue-950/70 border-blue-800/80 text-blue-300',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
