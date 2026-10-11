import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

    const sizeClasses = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-3.5 py-2 gap-2',
      lg: 'text-base px-4 py-2.5 gap-2.5',
    }

    const variantClasses = {
      primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:bg-emerald-700',
      secondary: 'bg-[#1a1e28] hover:bg-[#222936] text-slate-200 border border-[#2d3647]',
      outline: 'border border-[#2d3647] hover:bg-[#12151c] text-slate-300 hover:text-white',
      ghost: 'hover:bg-[#1a1e28] text-slate-400 hover:text-slate-100',
      danger: 'bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
