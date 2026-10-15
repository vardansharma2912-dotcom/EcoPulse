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
    emerald: 'bg-emerald-100/90 border-emerald-700/25 text-emerald-900 font-semibold dark:bg-emerald-950/60 dark:border-emerald-500/30 dark:text-emerald-300',
    amber: 'bg-amber-100/90 border-amber-700/30 text-amber-950 font-semibold dark:bg-amber-950/60 dark:border-amber-500/30 dark:text-amber-300',
    rose: 'bg-rose-100/90 border-rose-700/30 text-rose-950 font-semibold dark:bg-rose-950/60 dark:border-rose-500/30 dark:text-rose-300',
    neutral: 'bg-white/80 border-slate-300/80 text-slate-800 font-medium shadow-xs dark:bg-white/10 dark:border-white/15 dark:text-[#9db8a6]',
    blue: 'bg-teal-100/90 border-teal-700/25 text-teal-950 font-semibold dark:bg-teal-950/60 dark:border-teal-500/30 dark:text-teal-300',
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
