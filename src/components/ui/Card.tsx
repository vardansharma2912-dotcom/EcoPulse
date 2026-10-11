import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <div
      className={`rounded-xl bg-[#12151c] border border-[#222936] text-slate-100 ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
