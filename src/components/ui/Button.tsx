import React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  children?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className = '', disabled, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion()
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none'

    const sizeClasses = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-4 py-2.5 gap-2.5',
    }

    const variantClasses = {
      primary: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm shadow-emerald-950/10 dark:bg-[#059669] dark:hover:bg-[#10b981]',
      secondary: 'bg-white/80 hover:bg-white text-slate-800 border border-emerald-900/15 shadow-sm dark:bg-white/10 dark:hover:bg-white/15 dark:text-[#e8f5ec] dark:border-white/15',
      outline: 'border border-emerald-900/25 hover:bg-emerald-800/10 text-emerald-950 font-semibold dark:border-[#3ecf8e]/35 dark:hover:bg-[#3ecf8e]/10 dark:text-[#3ecf8e]',
      ghost: 'hover:bg-emerald-900/10 text-slate-700 hover:text-emerald-950 dark:text-[#9db8a6] dark:hover:text-[#e8f5ec] dark:hover:bg-white/10',
      danger: 'bg-rose-700 hover:bg-rose-800 text-white shadow-sm shadow-rose-950/10',
    }

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileTap={{ scale: disabled || shouldReduceMotion ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
