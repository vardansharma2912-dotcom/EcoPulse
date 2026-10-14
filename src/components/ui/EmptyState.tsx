import React from 'react'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="glass-card flex flex-col items-center justify-center text-center p-4 sm:p-6 border-dashed border-emerald-900/20 max-w-lg mx-auto w-full my-auto">
      {icon && (
        <div className="w-9 h-9 rounded-xl bg-emerald-800/10 border border-emerald-800/15 flex items-center justify-center text-emerald-800 mb-2 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-sm sm:text-base font-bold text-[#0f2418] mb-0.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#183624] max-w-sm mb-3 leading-snug font-medium">{description}</p>
      {action && <div className="mt-0.5">{action}</div>}
    </div>
  )
}
