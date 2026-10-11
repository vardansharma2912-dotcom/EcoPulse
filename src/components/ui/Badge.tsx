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
    emerald: 'bg-emerald-100/90 border-emerald-700/25 text-emerald-900 font-semibold',
    amber: 'bg-amber-100/90 border-amber-700/30 text-amber-950 font-semibold',
    rose: 'bg-rose-100/90 border-rose-700/30 text-rose-950 font-semibold',
    neutral: 'bg-white/80 border-slate-300/80 text-slate-800 font-medium shadow-xs',
    blue: 'bg-teal-100/90 border-teal-700/25 text-teal-950 font-semibold',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
