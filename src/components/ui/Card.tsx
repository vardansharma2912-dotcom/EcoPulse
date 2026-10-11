import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  variant?: 'glass' | 'glass-strong'
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  variant = 'glass',
  className = '',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6',
  }

  const variantClass = variant === 'glass-strong' ? 'glass-strong' : 'glass-card'

  return (
    <div
      className={`${variantClass} text-[#14301f] ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
