import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'glass' | 'glass-strong' | 'forest'
  interactive?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      padding = 'md',
      variant = 'glass',
      interactive = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3.5',
      md: 'p-5',
      lg: 'p-6',
    }

    const variantClasses = {
      glass: 'glass-card text-[#14301f]',
      'glass-strong': 'glass-strong text-[#14301f]',
      forest: 'bg-[#0a381e] text-white border border-emerald-800/60 shadow-xl shadow-emerald-950/20',
    }

    const interactiveClasses = interactive
      ? 'hover:-translate-y-[3px] hover:shadow-xl hover:shadow-emerald-950/15 cursor-pointer transition-all duration-200 ease-out'
      : ''

    return (
      <div
        ref={ref}
        className={`${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'
